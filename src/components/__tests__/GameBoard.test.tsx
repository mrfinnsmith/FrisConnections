import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GameBoard from '../Game/GameBoard'
import { Puzzle } from '@/types/game'

// Regression test for the bug where a CORRECT guess still removed one of the
// player's remaining mistakes.
//
// Root cause was in GameBoard.handleSubmit: it incremented attemptsUsed on every
// submission and wrote that incremented value into state even on a correct guess.
// The "Mistakes Remaining" dots derive from attemptsUsed, so a correct guess made
// a dot disappear.
//
// This test drives the REAL component (the Submit button runs handleSubmit). Note
// that lib/gameLogic.makeGuess has the same logic done correctly, but it is dead
// code and is not what the button calls, so the existing gameLogic unit tests did
// not catch this.

// Performance tracking returns "end" callbacks; stub them out.
vi.mock('@/lib/performance', () => ({
  trackGamePerformance: {
    gameInit: vi.fn(() => vi.fn()),
    guessSubmit: vi.fn(() => vi.fn()),
    tileRender: vi.fn(() => vi.fn()),
  },
}))

const puzzle: Puzzle = {
  id: 1,
  date: '2025-01-01',
  puzzle_number: 1,
  categories: [
    {
      id: 1,
      name: 'SF Hills',
      difficulty: 1,
      items: ['TWIN PEAKS', 'NOB HILL', 'RUSSIAN HILL', 'TELEGRAPH HILL'],
    },
    {
      id: 2,
      name: 'Tech Companies',
      difficulty: 2,
      items: ['ORACLE', 'SALESFORCE', 'UBER', 'TWITTER'],
    },
    {
      id: 3,
      name: 'MUNI Lines',
      difficulty: 3,
      items: ['N JUDAH', 'L TARAVAL', 'K INGLESIDE', 'M OCEAN VIEW'],
    },
    {
      id: 4,
      name: 'Food',
      difficulty: 4,
      items: ['IRISH COFFEE', 'SOURDOUGH', 'MISSION BURRITO', 'CIOPPINO'],
    },
  ],
}

// Tiles are exposed as role="gridcell"; only the Submit control is a button.
function clickTile(name: string) {
  fireEvent.click(screen.getByRole('gridcell', { name: new RegExp(name) }))
}

// A "used" mistake dot gets the mistake-dot-disappear class; remaining dots do not.
function usedMistakes(container: HTMLElement): number {
  return container.querySelectorAll('.mistake-dot-disappear').length
}

describe('GameBoard mistake counting', () => {
  it('does not consume a mistake on a correct guess', async () => {
    const { container } = render(<GameBoard puzzle={puzzle} />)

    expect(usedMistakes(container)).toBe(0)

    // Submit the four tiles of one real category.
    ;['TWIN PEAKS', 'NOB HILL', 'RUSSIAN HILL', 'TELEGRAPH HILL'].forEach(clickTile)
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    // handleSubmit resolves the guess only after its bounce animation (~1.2s), so
    // wait for the solved tiles to leave the grid rather than on a fixed timer.
    await waitFor(() => expect(screen.queryByRole('gridcell', { name: /TWIN PEAKS/ })).toBeNull(), {
      timeout: 3000,
    })

    // The guess was correct, so no mistake dot should have disappeared.
    expect(usedMistakes(container)).toBe(0)
  })
})

// Regression test for the bug where losing (exhausting all guesses) never showed
// the player the correct groups. On a loss, every category should be revealed on
// the board through the solved-group bars.
describe('GameBoard reveal on loss', () => {
  // handleSubmit resolves an incorrect guess only after its bounce (1000ms) and
  // shake (300ms) animations run on real timers, so wait out that known duration
  // between guesses rather than polling.
  const wrongGuessSettleMs = 1600
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  it('reveals every category on the board when the player runs out of guesses', async () => {
    render(<GameBoard puzzle={puzzle} />)

    // Four guesses that each take one tile from every category: never a match and
    // never "one away", so all four are wrong and the game is lost.
    const wrongGuesses = [
      ['TWIN PEAKS', 'ORACLE', 'N JUDAH', 'IRISH COFFEE'],
      ['NOB HILL', 'SALESFORCE', 'L TARAVAL', 'SOURDOUGH'],
      ['RUSSIAN HILL', 'UBER', 'K INGLESIDE', 'MISSION BURRITO'],
      ['TELEGRAPH HILL', 'TWITTER', 'M OCEAN VIEW', 'CIOPPINO'],
    ]

    for (const guess of wrongGuesses) {
      guess.forEach(clickTile)
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await sleep(wrongGuessSettleMs)
    }

    // The loss reveal appends every category to the board. Category names are only
    // rendered by the solved-group bars, so finding all four proves the whole
    // board was revealed. Before the fix, only the player's solved groups showed.
    puzzle.categories.forEach(category => {
      expect(screen.getByText(category.name)).toBeInTheDocument()
    })
  }, 20000)
})
