'use client'

import { Toast } from './Toast'
import { useState, useEffect } from 'react'
import { GameState, Puzzle } from '@/types/game'
import {
  createInitialGameState,
  getShuffledTiles,
  toggleTileSelection,
  makeGuess,
  shuffleArray
} from '@/lib/gameLogic'
import { createSession, getSessionExists } from '@/lib/session_api'
import TileGrid from './TileGrid'
import GameControls from './GameControls'
import SolvedGroups from './SolvedGroups'
import ResultsModal from './ResultsModal'
import { saveGameProgress, loadGameProgress, getOrCreateSessionId, updateUserStats } from '@/lib/localStorage'

interface GameBoardProps {
  puzzle: Puzzle
}

export default function GameBoard({ puzzle }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(puzzle))
  const [tiles, setTiles] = useState<string[]>(() => getShuffledTiles(puzzle))
  const [feedbackMessage, setFeedbackMessage] = useState<string>('')
  const [animatingTiles, setAnimatingTiles] = useState<string[]>([])
  const [animationType, setAnimationType] = useState<'shake' | 'bounce' | null>(null)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [sessionInitialized, setSessionInitialized] = useState(false)
  const handleToastComplete = () => {
    setGameState(prev => ({
      ...prev,
      showToast: false,
      toastMessage: ""
    }))
  }

  // Initialize session tracking
  useEffect(() => {
    const initializeSession = async () => {
      const sessionId = getOrCreateSessionId()

      // Check if session already exists for this puzzle
      const sessionExists = await getSessionExists(sessionId, puzzle.id)

      if (!sessionExists) {
        // Create new session
        await createSession(sessionId, puzzle.id)
      }

      // Update game state with session ID
      setGameState(prevState => ({
        ...prevState,
        sessionId
      }))

      setSessionInitialized(true)
    }

    initializeSession()
  }, [puzzle.id])

  // Load saved progress on mount (after session is initialized)
  useEffect(() => {
    if (!sessionInitialized) return

    const savedProgress = loadGameProgress(puzzle.id)
    if (savedProgress) {
      setGameState(prevState => ({
        ...prevState,
        ...savedProgress,
        puzzle, // Ensure puzzle is set
        sessionId: prevState.sessionId // Keep the session ID
      }))
    }
  }, [puzzle.id, sessionInitialized])

  // Update stats when game completes
  useEffect(() => {
    if (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') {
      updateUserStats(gameState.gameStatus === 'won', puzzle.date)
    }
  }, [gameState.gameStatus, puzzle.date])

  // Save progress when game state changes
  useEffect(() => {
    if (gameState.puzzle && sessionInitialized) {
      saveGameProgress(puzzle.id, gameState)
    }
  }, [gameState, puzzle.id, sessionInitialized])

  const handleTileClick = (tile: string) => {
    setGameState(prevState => toggleTileSelection(prevState, tile))
  }

  const handleSubmit = async () => {
    const { newGameState, isCorrect, category } = await makeGuess(gameState, gameState.selectedTiles)

    if (isCorrect && category) {
      // Start bounce animation for selected tiles
      setAnimatingTiles(gameState.selectedTiles)
      setAnimationType('bounce')

      // Update game state immediately
      setGameState(newGameState)

      // Remove tiles after animation completes (400ms + max delay)
      setTimeout(() => {
        setTiles(prevTiles =>
          prevTiles.filter(tile => !category.items.includes(tile))
        )
        setAnimatingTiles([])
        setAnimationType(null)
      }, 700)
    } else {
      // Start shake animation for selected tiles
      setAnimatingTiles(gameState.selectedTiles)
      setAnimationType('shake')
      setGameState(newGameState)

      // Clear shake animation after duration
      setTimeout(() => {
        setAnimatingTiles([])
        setAnimationType(null)
      }, 300)
    }

    // Clear feedback message after 2 seconds
    setTimeout(() => setFeedbackMessage(''), 2000)
  }

  const handleShuffle = () => {
    setTiles(prevTiles => shuffleArray(prevTiles))
  }

  const handleDeselectAll = () => {
    setGameState(prevState => ({
      ...prevState,
      selectedTiles: []
    }))
  }

  const getGameStatusMessage = () => {
    if (gameState.gameStatus === 'won') {
      return '🎉 Congratulations! You solved the puzzle!'
    }
    if (gameState.gameStatus === 'lost') {
      return '😔 Game over! Better luck tomorrow!'
    }
    return ''
  }

  return (
    <div className="w-full max-w-lg mx-auto">

      {/* Solved Groups */}
      <SolvedGroups solvedGroups={gameState.solvedGroups} />

      {/* Tile Grid */}
      <TileGrid
        gameState={gameState}
        tiles={tiles}
        onTileClick={handleTileClick}
        animatingTiles={animatingTiles}
        animationType={animationType}
      />

      {/* Game Controls */}
      <GameControls
        gameState={gameState}
        onSubmit={handleSubmit}
        onShuffle={handleShuffle}
        onDeselectAll={handleDeselectAll}
      />

      {/* Feedback Message */}
      {feedbackMessage && (
        <div className="mt-4 text-center">
          <p className="text-lg font-medium text-blue-600">
            {feedbackMessage}
          </p>
        </div>
      )}

      {/* Game Status Message */}
      {getGameStatusMessage() && (
        <div className="mt-4 text-center">
          <p className="text-xl font-bold text-gray-800">
            {getGameStatusMessage()}
          </p>
        </div>
      )}

      {/* View Results Button */}
      {(gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowResultsModal(true)}
            className="px-6 py-2 bg-white border border-gray-300 rounded-full font-medium hover:bg-gray-50"
          >
            View Results
          </button>
        </div>
      )}

      {/* Game Over - Show All Answers */}
      {gameState.gameStatus === 'lost' && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold text-lg mb-3 text-center">All Groups:</h3>
          <div className="space-y-2">
            {puzzle.categories.map((category) => (
              <div
                key={category.id}
                className={`p-3 rounded difficulty-${category.difficulty} text-center`}
              >
                <h4 className="font-semibold">{category.name}</h4>
                <p className="text-sm">{category.items.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Modal */}
      <ResultsModal
        gameState={gameState}
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
      />
      {/* Toast */}
      <Toast
        message={gameState.toastMessage}
        isVisible={gameState.showToast}
        onComplete={handleToastComplete}
      />
    </div>
  )
}