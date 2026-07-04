'use client'

import { useState, useEffect, useCallback } from 'react'
import TileGrid from './TileGrid'
import GameControls from './GameControls'
import SolvedGroups from './SolvedGroups'
import ResultsModal from './ResultsModal'
import { Toast } from './Toast'
import OnboardingModal from './OnboardingModal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { GameErrorFallback, ResultsErrorFallback } from '@/components/ErrorFallbacks'
import { Puzzle, GameState, SolvedGroup, GuessResult } from '@/types/game'
import {
  loadGameProgress,
  saveGameProgress,
  updateUserStats,
  getOrCreateSessionId,
  hasSeenOnboarding,
  markOnboardingSeen,
} from '@/lib/localStorage'
import { trackGamePerformance } from '@/lib/performance'
import { revealAllGroups } from '@/lib/gameLogic'
import { REVEAL_COLLAPSE_MS, revealDurationMs } from '@/lib/reveal'

interface GameBoardProps {
  puzzle: Puzzle
  isPastPuzzle?: boolean
  puzzleNumber?: number
}

export default function GameBoard({ puzzle, isPastPuzzle = false, puzzleNumber }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState>({
    puzzle: null,
    selectedTiles: [],
    solvedGroups: [],
    attemptsUsed: 0,
    gameStatus: 'playing',
    guessHistory: [],
    sessionId: undefined,
    showToast: false,
    toastMessage: '',
    shuffledItems: [],
  })
  const [showResults, setShowResults] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [animatingTiles, setAnimatingTiles] = useState<string[]>([])
  const [animationType, setAnimationType] = useState<
    'shake' | 'bounce' | 'shuffle' | 'shrink' | null
  >(null)

  const maxGuesses = 4

  // After a losing reveal cascade settles, hold a beat so the completed board is
  // visible before the results modal covers it.
  const resultsRevealBufferMs = 500

  // Screen reader announcement handler
  const announceToScreenReader = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message])
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(msg => msg !== message))
    }, 1000)
  }, [])

  // Keyboard interaction handler for tile grid
  const handleKeyboardInteraction = useCallback(
    (message: string) => {
      announceToScreenReader(message)
    },
    [announceToScreenReader]
  )

  // Shuffle function for tiles
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Get all items from puzzle categories
  const getAllItems = useCallback(() => {
    return puzzle.categories.flatMap(cat => cat.items)
  }, [puzzle])

  // Reconstruct solved groups from guess history
  const reconstructSolvedGroupsFromHistory = useCallback(
    (guessHistory: GuessResult[]): SolvedGroup[] => {
      return guessHistory
        .filter(guess => guess.isCorrect && guess.category)
        .map((guess, index) => ({
          category: guess.category!,
          solvedAt: index,
        }))
    },
    []
  )

  // Initialize game and check for onboarding
  useEffect(() => {
    if (!puzzle) return

    const endGameInit = trackGamePerformance.gameInit(puzzle.id)

    const sessionId = getOrCreateSessionId()
    const savedProgress = loadGameProgress(puzzle.id)

    if (savedProgress) {
      const status = savedProgress.gameStatus || 'playing'
      let solvedGroups = reconstructSolvedGroupsFromHistory(savedProgress.guessHistory || [])

      // A lost game reveals every category on the board; restore that on reload.
      // These groups are present at mount, so they show without re-animating.
      if (status === 'lost') {
        solvedGroups = revealAllGroups(puzzle, solvedGroups)
      }

      setGameState({
        puzzle,
        selectedTiles: savedProgress.selectedTiles || [],
        solvedGroups,
        attemptsUsed: savedProgress.attemptsUsed || 0,
        gameStatus: status,
        guessHistory: savedProgress.guessHistory || [],
        sessionId,
        showToast: false,
        toastMessage: '',
        shuffledItems: [],
      })

      // Set shuffled items based on what's not solved
      const solvedItems = solvedGroups.flatMap(sg => sg.category.items)
      const remainingItems = getAllItems().filter(item => !solvedItems.includes(item))
      const allItemsInOrder = [...solvedItems, ...shuffleArray(remainingItems)]
      setGameState(prev => ({ ...prev, shuffledItems: allItemsInOrder }))
    } else {
      setGameState({
        puzzle,
        selectedTiles: [],
        solvedGroups: [],
        attemptsUsed: 0,
        gameStatus: 'playing',
        guessHistory: [],
        sessionId,
        showToast: false,
        toastMessage: '',
        shuffledItems: shuffleArray(getAllItems()),
      })
    }

    // Check if we should show onboarding (only if puzzle exists and user hasn't seen it)
    if (!hasSeenOnboarding()) {
      setShowOnboarding(true)
    }

    endGameInit()
  }, [puzzle, getAllItems, reconstructSolvedGroupsFromHistory])

  // Save progress whenever game state changes
  useEffect(() => {
    if (!gameState.puzzle) return
    saveGameProgress(gameState.puzzle.id, gameState)
  }, [gameState])

  const handleTileClick = (item: string) => {
    if (gameState.gameStatus !== 'playing') return

    setGameState(prev => ({
      ...prev,
      selectedTiles: prev.selectedTiles.includes(item)
        ? prev.selectedTiles.filter(tile => tile !== item)
        : prev.selectedTiles.length < 4
          ? [...prev.selectedTiles, item]
          : prev.selectedTiles,
    }))
  }

  const handleSubmit = async () => {
    if (gameState.selectedTiles.length !== 4 || gameState.gameStatus !== 'playing') return

    const endGuessSubmit = trackGamePerformance.guessSubmit(gameState.selectedTiles)

    // Check if this combination matches any category
    const matchingCategory = puzzle.categories.find(
      category =>
        gameState.selectedTiles.every(tile => category.items.includes(tile)) &&
        category.items.every(item => gameState.selectedTiles.includes(item))
    )

    // Trigger bounce animation on submit for all selected tiles
    setAnimatingTiles([...gameState.selectedTiles])
    setAnimationType('bounce')

    // Wait for bounce animation timeout (1200ms if correct, 1000ms if incorrect)
    const bounceTimeout = matchingCategory ? 1200 : 1000
    await new Promise(resolve => setTimeout(resolve, bounceTimeout))

    // Clear bounce animation
    setAnimatingTiles([])
    setAnimationType(null)

    // A correct guess must not consume an attempt; only incorrect guesses do.
    const newAttemptsUsed = matchingCategory ? gameState.attemptsUsed : gameState.attemptsUsed + 1

    // Check if guess is "one away" from any category
    const isOneAway =
      !matchingCategory &&
      puzzle.categories.some(category => {
        const matchCount = gameState.selectedTiles.filter(item =>
          category.items.includes(item)
        ).length
        return matchCount === 3
      })

    const guessResult: GuessResult = {
      items: [...gameState.selectedTiles],
      isCorrect: !!matchingCategory,
      isOneAway,
      category: matchingCategory,
      attemptNumber: newAttemptsUsed,
      itemDifficulties: gameState.selectedTiles.map(item => {
        const category = puzzle.categories.find(cat => cat.items.includes(item))
        return category?.difficulty || 1
      }),
    }

    const newGuessHistory = [...gameState.guessHistory, guessResult]

    if (matchingCategory) {
      // Correct guess - move tiles to solved group
      const newSolvedGroup: SolvedGroup = {
        category: matchingCategory,
        solvedAt: gameState.solvedGroups.length,
      }

      const newSolvedGroups = [...gameState.solvedGroups, newSolvedGroup]
      const newGameStatus = newSolvedGroups.length === 4 ? 'won' : 'playing'

      // Update state to move tiles to solved group
      const solvedItems = newSolvedGroups.flatMap(sg => sg.category.items)
      const remainingItems = getAllItems().filter(item => !solvedItems.includes(item))
      const allItemsInOrder = [...solvedItems, ...shuffleArray(remainingItems)]

      setGameState(prev => ({
        ...prev,
        selectedTiles: [],
        solvedGroups: newSolvedGroups,
        shuffledItems: allItemsInOrder,
        attemptsUsed: newAttemptsUsed,
        gameStatus: newGameStatus,
        guessHistory: newGuessHistory,
        showToast: false,
        toastMessage: '',
      }))

      // Announce correct guess
      const difficultyColors = { 1: 'Yellow', 2: 'Green', 3: 'Blue', 4: 'Purple' }
      const difficultyColor =
        difficultyColors[matchingCategory.difficulty as keyof typeof difficultyColors] || 'Unknown'
      announceToScreenReader(
        `Correct! You found the ${difficultyColor} category: ${matchingCategory.name}. ${4 - newSolvedGroups.length} groups remaining.`
      )

      // Check if game is won
      if (newGameStatus === 'won') {
        if (!isPastPuzzle) {
          updateUserStats(true, puzzle.date)
        }
        announceToScreenReader(`Congratulations! You solved all 4 groups and won the puzzle!`)
        // Let the final banner's flip + pulse play before the modal covers it
        setTimeout(() => setShowResults(true), 1000)
      }
    } else {
      // Wrong guess - trigger shake animation
      let showToast = false
      let toastMessage = ''
      let screenReaderMessage = `Incorrect guess. ${maxGuesses - newAttemptsUsed} mistakes remaining.`

      if (isOneAway) {
        showToast = true
        toastMessage = 'One away...'
        screenReaderMessage = `One away! You have 3 correct items. ${maxGuesses - newAttemptsUsed} mistakes remaining.`
      }

      const newGameStatus = newAttemptsUsed >= maxGuesses ? 'lost' : 'playing'

      // Trigger shake animation for incorrect guess
      setAnimatingTiles([...gameState.selectedTiles])
      setAnimationType('shake')

      // Wait for shake animation to complete (200ms * 1.5 iterations = 300ms)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Clear animations
      setAnimatingTiles([])
      setAnimationType(null)

      if (newGameStatus === 'lost') {
        // Reveal the answers NYT-style: each unsolved group reveals one at a
        // time in difficulty order. Its four tiles collapse up and fade, then
        // its colored bar flips in, exactly as a manual correct guess looks.
        // revealAllGroups appends the unsolved categories (difficulty order)
        // after the ones the player already solved.
        const alreadySolved = gameState.solvedGroups
        const groupsToReveal = revealAllGroups(puzzle, alreadySolved).slice(alreadySolved.length)

        setGameState(prev => ({
          ...prev,
          selectedTiles: [],
          attemptsUsed: newAttemptsUsed,
          gameStatus: 'lost',
          guessHistory: newGuessHistory,
          showToast: false,
          toastMessage: '',
        }))

        announceToScreenReader(screenReaderMessage)

        if (!isPastPuzzle) {
          updateUserStats(false, puzzle.date)
        }
        announceToScreenReader(
          `Game over. You used all ${maxGuesses} attempts. Revealing the correct groups.`
        )

        // Reveal groups sequentially: collapse a group's tiles, then add it to
        // solvedGroups so its bar flips in, and wait for that to settle before
        // starting the next. The awaits use the reveal.ts timing constants, so
        // the loop finishes exactly at the true end of the cascade.
        const revealed = [...alreadySolved]
        for (const group of groupsToReveal) {
          setAnimatingTiles([...group.category.items])
          setAnimationType('shrink')
          await new Promise(resolve => setTimeout(resolve, REVEAL_COLLAPSE_MS))
          setAnimatingTiles([])
          setAnimationType(null)

          revealed.push(group)
          const nextRevealed = [...revealed]
          setGameState(prev => ({ ...prev, solvedGroups: nextRevealed }))
          await new Promise(resolve => setTimeout(resolve, revealDurationMs(1)))
        }

        // The cascade has fully settled; hold a beat, then open the modal.
        setTimeout(() => setShowResults(true), resultsRevealBufferMs)
      } else {
        setGameState(prev => ({
          ...prev,
          selectedTiles: [],
          attemptsUsed: newAttemptsUsed,
          gameStatus: 'playing',
          guessHistory: newGuessHistory,
          showToast,
          toastMessage,
        }))

        // Announce incorrect guess
        announceToScreenReader(screenReaderMessage)
      }
    }

    endGuessSubmit()
  }

  const handleShuffle = () => {
    if (gameState.gameStatus !== 'playing') return

    const solvedItems = gameState.solvedGroups.flatMap(sg => sg.category.items)
    const remainingItems = getAllItems().filter(item => !solvedItems.includes(item))
    const allItemsInOrder = [...solvedItems, ...shuffleArray(remainingItems)]
    setGameState(prev => ({ ...prev, shuffledItems: allItemsInOrder, selectedTiles: [] }))

    // Trigger shuffle animation on all remaining tiles
    setAnimatingTiles(remainingItems)
    setAnimationType('shuffle')

    // Clear animation after 1s (duration of shuffle animation)
    setTimeout(() => {
      setAnimatingTiles([])
      setAnimationType(null)
    }, 1000)
  }

  const handleDeselectAll = () => {
    setGameState(prev => ({ ...prev, selectedTiles: [] }))
  }

  const handleToastComplete = () => {
    setGameState(prev => ({ ...prev, showToast: false, toastMessage: '' }))
  }

  const handleOnboardingClose = () => {
    setShowOnboarding(false)
    markOnboardingSeen()
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <OnboardingModal isVisible={showOnboarding} onClose={handleOnboardingClose} />

      <div className="text-center mb-6">
        <p className="text-sm sm:text-base">Create four groups of four!</p>
      </div>

      <ErrorBoundary fallback={<GameErrorFallback />}>
        <SolvedGroups solvedGroups={gameState.solvedGroups} />

        <TileGrid
          gameState={gameState}
          onTileClick={handleTileClick}
          animatingTiles={animatingTiles}
          animationType={animationType}
          onKeyboardInteraction={handleKeyboardInteraction}
        />

        <GameControls
          gameState={gameState}
          onSubmit={handleSubmit}
          onShuffle={handleShuffle}
          onDeselectAll={handleDeselectAll}
        />
      </ErrorBoundary>

      <ErrorBoundary fallback={<ResultsErrorFallback onClose={() => setShowResults(false)} />}>
        <ResultsModal
          gameState={gameState}
          isOpen={showResults}
          onClose={() => setShowResults(false)}
        />
      </ErrorBoundary>

      <Toast
        message={gameState.toastMessage}
        isVisible={gameState.showToast}
        onComplete={handleToastComplete}
      />

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcements.map((announcement, index) => (
          <div key={`announcement-${index}-${announcement}`}>{announcement}</div>
        ))}
      </div>
    </div>
  )
}
