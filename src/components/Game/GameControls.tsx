'use client'

import { GameState } from '@/types/game'
import { canSubmitGuess, getRemainingAttempts } from '@/lib/gameLogic'

interface GameControlsProps {
  gameState: GameState
  onSubmit: () => void
  onShuffle: () => void
  onDeselectAll: () => void
}

export default function GameControls({
  gameState,
  onSubmit,
  onShuffle,
  onDeselectAll
}: GameControlsProps) {
  const canSubmit = canSubmitGuess(gameState)
  const remainingAttempts = getRemainingAttempts(gameState)
  const hasSelection = gameState.selectedTiles.length > 0
  const isPlaying = gameState.gameStatus === 'playing'

  return (
    <div className="space-y-4">
      {/* Game Status */}
      <div className="text-center">
        <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          Mistakes remaining: {remainingAttempts}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Groups found: {gameState.solvedGroups.length} of {gameState.puzzle?.categories.length || 4}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3">
        <button
          className="game-button secondary"
          onClick={onShuffle}
          disabled={!isPlaying}
        >
          Shuffle
        </button>

        <button
          className="game-button secondary"
          onClick={onDeselectAll}
          disabled={!hasSelection || !isPlaying}
        >
          Deselect All
        </button>

        <button
          className="game-button primary"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          Submit
        </button>
      </div>

      {/* Selection Info */}
      {gameState.selectedTiles.length > 0 && (
        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Selected: {gameState.selectedTiles.length}/4 tiles
          </p>
        </div>
      )}
    </div>
  )
}