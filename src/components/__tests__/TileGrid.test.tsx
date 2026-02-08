import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TileGrid from '../Game/TileGrid'
import { GameState } from '@/types/game'
import { accessibilityHelpers } from '@/test/accessibility'

// Mock performance tracking
vi.mock('@/lib/performance', () => ({
  trackGamePerformance: {
    tileRender: vi.fn(() => vi.fn()),
  },
}))

// Mock game logic
vi.mock('@/lib/gameLogic', () => ({
  getAvailableTiles: vi.fn((gameState: GameState) =>
    gameState.shuffledItems.filter(
      item => !gameState.solvedGroups.some(group => group.category.items.includes(item))
    )
  ),
}))

const mockGameState: GameState = {
  puzzle: {
    id: 1,
    puzzle_number: 1,
    date: '2025-01-01',
    categories: [],
    published: true,
    created_at: '2025-01-01T00:00:00Z',
  },
  selectedTiles: ['Twin Peaks'],
  solvedGroups: [],
  attemptsUsed: 1,
  gameStatus: 'playing',
  guessHistory: [],
  sessionId: 'test-session',
  showToast: false,
  toastMessage: '',
  shuffledItems: ['Twin Peaks', 'Nob Hill', 'Oracle', 'Salesforce'],
}

describe('TileGrid', () => {
  const mockOnTileClick = vi.fn()
  const mockOnKeyboardInteraction = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders tiles correctly', () => {
    render(
      <TileGrid
        gameState={mockGameState}
        onTileClick={mockOnTileClick}
        animatingTiles={[]}
        animationType={null}
        onKeyboardInteraction={mockOnKeyboardInteraction}
      />
    )

    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByText('Twin Peaks')).toBeInTheDocument()
    expect(screen.getByText('Nob Hill')).toBeInTheDocument()
    expect(screen.getByText('Oracle')).toBeInTheDocument()
    expect(screen.getByText('Salesforce')).toBeInTheDocument()
  })

  it('shows selected tiles with correct styling', () => {
    render(
      <TileGrid
        gameState={mockGameState}
        onTileClick={mockOnTileClick}
        animatingTiles={[]}
        animationType={null}
        onKeyboardInteraction={mockOnKeyboardInteraction}
      />
    )

    const selectedTile = screen.getByText('Twin Peaks').closest('button')!
    expect(selectedTile).toHaveAttribute('aria-pressed', 'true')
    expect(selectedTile).toHaveClass('selected')
  })

  it('calls onTileClick when tile is clicked', async () => {
    const user = userEvent.setup()

    render(
      <TileGrid
        gameState={mockGameState}
        onTileClick={mockOnTileClick}
        animatingTiles={[]}
        animationType={null}
        onKeyboardInteraction={mockOnKeyboardInteraction}
      />
    )

    await user.click(screen.getByText('Nob Hill'))
    expect(mockOnTileClick).toHaveBeenCalledWith('Nob Hill')
  })

  it('has proper ARIA labels for accessibility', () => {
    render(
      <TileGrid
        gameState={mockGameState}
        onTileClick={mockOnTileClick}
        animatingTiles={[]}
        animationType={null}
        onKeyboardInteraction={mockOnKeyboardInteraction}
      />
    )

    const grid = screen.getByRole('grid')
    expect(grid).toHaveAttribute(
      'aria-label',
      'Game tiles - use arrow keys to navigate, Enter or Space to select'
    )

    const firstTile = screen.getByText('Twin Peaks').closest('button')!
    expect(firstTile).toHaveAttribute('role', 'gridcell')
    expect(firstTile).toHaveAttribute('aria-label', expect.stringContaining('Twin Peaks, selected'))
    expect(firstTile).toHaveAttribute('aria-label', expect.stringContaining('Row 1, Column 1'))
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()

    render(
      <TileGrid
        gameState={mockGameState}
        onTileClick={mockOnTileClick}
        animatingTiles={[]}
        animationType={null}
        onKeyboardInteraction={mockOnKeyboardInteraction}
      />
    )

    const firstTile = screen.getByText('Twin Peaks').closest('button')!
    firstTile.focus()

    // Test arrow key navigation
    await user.keyboard('{ArrowRight}')
    expect(mockOnKeyboardInteraction).toHaveBeenCalledWith('Moved to Nob Hill')

    // Test Enter key selection
    await user.keyboard('{Enter}')
    expect(mockOnTileClick).toHaveBeenCalled()
  })

  it('handles keyboard events on the grid', async () => {
    const user = userEvent.setup()

    render(
      <TileGrid
        gameState={mockGameState}
        onTileClick={mockOnTileClick}
        animatingTiles={[]}
        animationType={null}
        onKeyboardInteraction={mockOnKeyboardInteraction}
      />
    )

    const grid = screen.getByRole('grid')
    grid.focus()

    await user.keyboard('{ArrowRight}')
    expect(mockOnKeyboardInteraction).toHaveBeenCalled()
  })

  it('disables tiles when game is not playing', () => {
    const gameOverState = {
      ...mockGameState,
      gameStatus: 'won' as const,
    }

    render(
      <TileGrid
        gameState={gameOverState}
        onTileClick={mockOnTileClick}
        animatingTiles={[]}
        animationType={null}
        onKeyboardInteraction={mockOnKeyboardInteraction}
      />
    )

    const tiles = screen.getAllByRole('gridcell')
    tiles.forEach(tile => {
      expect(tile).toBeDisabled()
    })
  })

  it('applies animation classes correctly', () => {
    render(
      <TileGrid
        gameState={mockGameState}
        onTileClick={mockOnTileClick}
        animatingTiles={['Twin Peaks']}
        animationType="shake"
        onKeyboardInteraction={mockOnKeyboardInteraction}
      />
    )

    const animatedTile = screen.getByText('Twin Peaks').closest('button')!
    expect(animatedTile).toHaveClass('shake')
  })

  it('includes accessibility instructions', () => {
    render(
      <TileGrid
        gameState={mockGameState}
        onTileClick={mockOnTileClick}
        animatingTiles={[]}
        animationType={null}
        onKeyboardInteraction={mockOnKeyboardInteraction}
      />
    )

    const instructions = screen.getByText(/Use arrow keys to navigate between tiles/)
    expect(instructions).toBeInTheDocument()
    expect(instructions).toHaveClass('sr-only') // Screen reader only
  })

  it('passes comprehensive accessibility tests', async () => {
    const user = userEvent.setup()

    const result = render(
      <TileGrid
        gameState={mockGameState}
        onTileClick={mockOnTileClick}
        animatingTiles={[]}
        animationType={null}
        onKeyboardInteraction={mockOnKeyboardInteraction}
      />
    )

    // Test ARIA labels
    accessibilityHelpers.testAriaLabels(result, [
      'Game tiles',
      'Twin Peaks',
      'Nob Hill',
      'Row 1, Column 1',
    ])

    // Test keyboard navigation
    await accessibilityHelpers.testKeyboardNavigation(result, user)
  })
})
