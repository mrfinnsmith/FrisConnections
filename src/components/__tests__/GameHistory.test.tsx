import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GameHistory from '../Stats/GameHistory'
import { PuzzleResult } from '@/types/game'

// attemptsUsed is the number of *incorrect* guesses (a correct guess never
// consumes one), so a flawless win is 0 and a win maxes out at 3. These tests
// pin the history labels to that convention.
const result = (overrides: Partial<PuzzleResult>): PuzzleResult => ({
  puzzleId: 1,
  date: '2025-01-01',
  won: true,
  attemptsUsed: 0,
  ...overrides,
})

describe('GameHistory attempt labels', () => {
  it('labels a flawless win (zero incorrect guesses) as Perfect', () => {
    render(<GameHistory puzzleHistory={[result({ puzzleId: 1, attemptsUsed: 0 })]} />)

    expect(screen.getByText('0/4')).toBeInTheDocument()
    expect(screen.getByText('Perfect!')).toBeInTheDocument()
  })

  it('labels a win with three mistakes as a Close call', () => {
    render(<GameHistory puzzleHistory={[result({ puzzleId: 2, attemptsUsed: 3 })]} />)

    expect(screen.getByText('3/4')).toBeInTheDocument()
    expect(screen.getByText('Close call')).toBeInTheDocument()
  })

  it('shows Lost for a lost puzzle', () => {
    render(<GameHistory puzzleHistory={[result({ puzzleId: 3, won: false, attemptsUsed: 4 })]} />)

    expect(screen.getByText('Lost')).toBeInTheDocument()
  })
})
