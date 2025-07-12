'use client'

import { useState, useEffect } from 'react'
import { GameState, Puzzle } from '@/types/game'
import { 
  createInitialGameState, 
  getShuffledTiles, 
  toggleTileSelection,
  makeGuess,
  shuffleArray
} from '@/lib/gameLogic'
import { saveGameProgress, loadGameProgress } from '@/lib/localStorage'
import TileGrid from './TileGrid'
import GameControls from './GameControls'
import SolvedGroups from './SolvedGroups'

interface GameBoardProps {
  puzzle: Puzzle
}

export default function GameBoard({ puzzle }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(puzzle))
  const [tiles, setTiles] = useState<string[]>(() => getShuffledTiles(puzzle))
  const [feedbackMessage, setFeedbackMessage] = useState<string>('')
  const [showShakeAnimation, setShowShakeAnimation] = useState(false)

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = loadGameProgress(puzzle.id)
    if (savedProgress) {
      setGameState(prevState => ({
        ...prevState,
        ...savedProgress,
        puzzle // Ensure puzzle is set
      }))
    }
  }, [puzzle.id])

  // Save progress when game state changes
  useEffect(() => {
    if (gameState.puzzle) {
      saveGameProgress(puzzle.id, gameState)
    }
  }, [gameState, puzzle.id])

  const handleTileClick = (tile: string) => {
    setGameState(prevState => toggleTileSelection(prevState, tile))
  }

  const handleSubmit = () => {
    const { newGameState, isCorrect, category } = makeGuess(gameState, gameState.selectedTiles)
    
    if (isCorrect && category) {
      setFeedbackMessage(`Correct! "${category.name}"`)
      setGameState(newGameState)
      
      // Remove solved tiles from the tile grid
      setTiles(prevTiles => 
        prevTiles.filter(tile => !category.items.includes(tile))
      )
    } else {
      setFeedbackMessage('Not quite right. Try again!')
      setShowShakeAnimation(true)
      setGameState(newGameState)
      
      // Clear shake animation after duration
      setTimeout(() => setShowShakeAnimation(false), 500)
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
      {/* Puzzle Info */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Puzzle #{puzzle.puzzle_number}
        </h2>
        <p className="text-gray-600 text-sm">
          {new Date(puzzle.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Solved Groups */}
      <SolvedGroups solvedGroups={gameState.solvedGroups} />

      {/* Tile Grid */}
      <div className={showShakeAnimation ? 'animate-shake' : ''}>
        <TileGrid 
          gameState={gameState}
          tiles={tiles}
          onTileClick={handleTileClick}
        />
      </div>

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
    </div>
  )
}