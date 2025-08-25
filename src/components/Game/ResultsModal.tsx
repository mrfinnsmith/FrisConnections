'use client'

import { GameState, DIFFICULTY_COLORS } from '@/types/game'
import { useState } from 'react'
import { getUserStats } from '@/lib/localStorage'

interface ResultsModalProps {
  gameState: GameState
  isOpen: boolean
  onClose: () => void
}

export default function ResultsModal({ gameState, isOpen, onClose }: ResultsModalProps) {
  if (!isOpen || !gameState.puzzle) return null

  const userStats = getUserStats()
  const winPercentage = userStats.gamesPlayed > 0
    ? Math.round((userStats.gamesWon / userStats.gamesPlayed) * 100)
    : 0

  const stats = {
    completed: userStats.gamesPlayed,
    winPercentage: winPercentage,
    currentStreak: userStats.currentStreak,
    maxStreak: userStats.maxStreak
  }

  const generateShareText = (): string => {
    const { puzzle, guessHistory } = gameState
    if (!puzzle) return ''

    const emojiGrid = guessHistory.map(guess =>
      guess.itemDifficulties.map(difficulty => {
        if (difficulty === 1) return '🟨'
        if (difficulty === 2) return '🟩'
        if (difficulty === 3) return '🟦'
        if (difficulty === 4) return '🟪'
      }).join('')
    ).join('\n')

    return `FrisConnections\nPuzzle #${puzzle.puzzle_number}\n${emojiGrid}\n\nhttps://frisconnections.lol`
  }

  const handleShare = async () => {
    const shareText = generateShareText()
    try {
      await navigator.clipboard.writeText(shareText)
      setShowCopiedMessage(true)
      setTimeout(() => setShowCopiedMessage(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const [showCopiedMessage, setShowCopiedMessage] = useState(false)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">★</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {gameState.gameStatus === 'won' ? 'Congratulations!' : 'Next Time!'}
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.winPercentage}</div>
            <div className="text-sm text-gray-600">Win %</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.maxStreak}</div>
            <div className="text-sm text-gray-600">Max Streak</div>
          </div>
        </div>

        {/* Separator */}
        <hr className="border-gray-300 mb-6" />

        {/* Guess Grid */}
        <div className="space-y-2 mb-6">
          {gameState.guessHistory.map((guess, index) => (
            <div key={index} className="flex gap-1 justify-center">
              {guess.itemDifficulties.map((difficulty, boxIndex) => (
                <div
                  key={boxIndex}
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: DIFFICULTY_COLORS[difficulty as 1 | 2 | 3 | 4] }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full bg-black text-white py-3 rounded-full font-medium"
        >
          {showCopiedMessage ? 'Copied!' : 'Share Your Results'}
        </button>
      </div>
    </div>
  )
}