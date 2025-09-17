'use client'

import React, { useMemo, memo } from 'react'
import { GameState } from '@/types/game'
import { canSubmitGuess, getRemainingAttempts } from '@/lib/gameLogic'

interface GameControlsProps {
  gameState: GameState
  onSubmit: () => void
  onShuffle: () => void
  onDeselectAll: () => void
}

function GameControls({
  gameState,
  onSubmit,
  onShuffle,
  onDeselectAll
}: GameControlsProps) {
  // Memoize calculations to prevent unnecessary recalculation
  const gameData = useMemo(() => {
    const canSubmit = canSubmitGuess(gameState)
    const remainingAttempts = getRemainingAttempts(gameState)
    const hasSelection = gameState.selectedTiles.length > 0
    const isPlaying = gameState.gameStatus === 'playing'
    
    return {
      canSubmit,
      remainingAttempts,
      hasSelection,
      isPlaying
    }
  }, [gameState])

  // Memoize mistake dots to prevent array recreation
  const mistakeDots = useMemo(() => 
    Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className={`w-3 h-3 rounded-full ${
          i < gameData.remainingAttempts ? 'bg-gray-600' : 'mistake-dot-disappear'
        }`}
      />
    )), [gameData.remainingAttempts]
  )

  return (
    <div className="space-y-6">
      {/* Mistakes Display */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Mistakes Remaining:</p>
        <div className="flex justify-center gap-1">
          {mistakeDots}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-2">
        <button
          className="game-button secondary"
          onClick={onShuffle}
          disabled={!gameData.isPlaying}
        >
          Shuffle
        </button>

        <button
          className="game-button secondary"
          onClick={onDeselectAll}
          disabled={!gameData.hasSelection || !gameData.isPlaying}
        >
          Deselect All
        </button>

        <button
          className="game-button primary"
          onClick={onSubmit}
          disabled={!gameData.canSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

// Export memoized component
export default memo(GameControls)