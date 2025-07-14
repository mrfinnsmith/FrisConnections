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
  const mistakesMade = 4 - remainingAttempts

  return (
    <div className="space-y-6">
      {/* Mistakes Display */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Mistakes Remaining:</p>
        <div className="flex justify-center gap-1">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i < remainingAttempts ? 'bg-gray-600' : 'mistake-dot-disappear'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-2">
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
    </div>
  )
}