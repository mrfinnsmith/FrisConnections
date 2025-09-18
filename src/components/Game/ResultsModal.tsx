'use client'

import { GameState, DIFFICULTY_COLORS } from '@/types/game'
import { useState, useEffect, useRef } from 'react'
import { getUserStats } from '@/lib/localStorage'

interface ResultsModalProps {
  gameState: GameState
  isOpen: boolean
  onClose: () => void
}

export default function ResultsModal({ gameState, isOpen, onClose }: ResultsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const shareButtonRef = useRef<HTMLButtonElement>(null)
  
  if (!isOpen || !gameState.puzzle) return null

  const userStats = getUserStats()
  const winPercentage = userStats.gamesPlayed > 0
    ? Math.round((userStats.gamesWon / userStats.gamesPlayed) * 100)
    : 0

  const stats = {
    completed: userStats.gamesPlayed,
    winPercentage: winPercentage,
    attemptsUsed: gameState.attemptsUsed,
    gamesWon: userStats.gamesWon
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
  
  // Focus trap functionality
  useEffect(() => {
    if (!isOpen) return
    
    // Focus the close button when modal opens
    const focusCloseButton = () => {
      closeButtonRef.current?.focus()
    }
    
    // Small delay to ensure modal is rendered
    const timeoutId = setTimeout(focusCloseButton, 100)
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      
      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>
        
        if (!focusableElements || focusableElements.length === 0) return
        
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        
        if (event.shiftKey) {
          // Shift + Tab (backward)
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab (forward)
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden'
    
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-title"
      aria-describedby="results-description"
      onClick={(e) => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
          aria-label="Close results modal"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">★</span>
          </div>
          <h2 id="results-title" className="text-3xl font-bold mb-2">
            {gameState.gameStatus === 'won' ? 'Congratulations!' : 'Next Time!'}
          </h2>
          <div id="results-description" className="sr-only">
            Game results showing your statistics and guess history. Use Tab to navigate between elements or press Escape to close.
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6" role="group" aria-label="Game statistics">
          <div className="text-center">
            <div className="text-2xl font-bold" aria-label={`${stats.completed} puzzles completed`}>{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" aria-label={`${stats.winPercentage} percent win rate`}>{stats.winPercentage}</div>
            <div className="text-sm text-gray-600">Win %</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" aria-label={`${stats.attemptsUsed} attempts used this game`}>{stats.attemptsUsed}</div>
            <div className="text-sm text-gray-600">Attempts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" aria-label={`${stats.gamesWon} total games won`}>{stats.gamesWon}</div>
            <div className="text-sm text-gray-600">Won</div>
          </div>
        </div>

        {/* Separator */}
        <hr className="border-gray-300 mb-6" />

        {/* Guess Grid */}
        <div className="space-y-2 mb-6" role="group" aria-label="Your guess history">
          {gameState.guessHistory.map((guess, index) => {
            const difficultyNames = { 1: 'Yellow', 2: 'Green', 3: 'Blue', 4: 'Purple' }
            const guessDescription = guess.itemDifficulties
              .map(d => difficultyNames[d as keyof typeof difficultyNames])
              .join(', ')
            
            return (
              <div 
                key={index} 
                className="flex gap-1 justify-center"
                role="group"
                aria-label={`Guess ${index + 1}: ${guess.isCorrect ? 'Correct' : 'Incorrect'}. Difficulty colors: ${guessDescription}`}
              >
                {guess.itemDifficulties.map((difficulty, boxIndex) => (
                  <div
                    key={boxIndex}
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: DIFFICULTY_COLORS[difficulty as 1 | 2 | 3 | 4] }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )
          })}
        </div>

        {/* Share Button */}
        <button
          ref={shareButtonRef}
          onClick={handleShare}
          className="w-full bg-black text-white py-3 rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label={showCopiedMessage ? 'Results copied to clipboard' : 'Copy results to clipboard for sharing'}
        >
          {showCopiedMessage ? 'Copied!' : 'Share Your Results'}
        </button>
      </div>
    </div>
  )
}