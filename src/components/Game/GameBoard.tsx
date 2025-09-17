'use client';

import { useState, useEffect, useCallback } from 'react';
import TileGrid from './TileGrid';
import GameControls from './GameControls';
import SolvedGroups from './SolvedGroups';
import ResultsModal from './ResultsModal';
import { Toast } from './Toast';
import OnboardingModal from './OnboardingModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GameErrorFallback, ResultsErrorFallback } from '@/components/ErrorFallbacks';
import { Puzzle, GameState, Category, SolvedGroup, GuessResult } from '@/types/game';
import {
  loadGameProgress,
  saveGameProgress,
  updateUserStats,
  getOrCreateSessionId,
  hasSeenOnboarding,
  markOnboardingSeen
} from '@/lib/localStorage';
import { trackGamePerformance } from '@/lib/performance';

interface GameBoardProps {
  puzzle: Puzzle;
  isPastPuzzle?: boolean;
  puzzleNumber?: number;
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
    shuffledItems: []
  });
  const [showResults, setShowResults] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const maxGuesses = 4;

  // Shuffle function for tiles
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get all items from puzzle categories
  const getAllItems = useCallback(() => {
    return puzzle.categories.flatMap(cat => cat.items);
  }, [puzzle]);

  // Reconstruct solved groups from guess history
  const reconstructSolvedGroupsFromHistory = useCallback((guessHistory: GuessResult[]): SolvedGroup[] => {
    return guessHistory
      .filter(guess => guess.isCorrect && guess.category)
      .map((guess, index) => ({
        category: guess.category!,
        solvedAt: index
      }));
  }, []);

  // Initialize game and check for onboarding
  useEffect(() => {
    if (!puzzle) return;

    const endGameInit = trackGamePerformance.gameInit(puzzle.id);

    const sessionId = getOrCreateSessionId();
    const savedProgress = loadGameProgress(puzzle.id);

    if (savedProgress) {
      const solvedGroups = reconstructSolvedGroupsFromHistory(savedProgress.guessHistory || []);

      setGameState({
        puzzle,
        selectedTiles: savedProgress.selectedTiles || [],
        solvedGroups,
        attemptsUsed: savedProgress.attemptsUsed || 0,
        gameStatus: savedProgress.gameStatus || 'playing',
        guessHistory: savedProgress.guessHistory || [],
        sessionId,
        showToast: false,
        toastMessage: '',
        shuffledItems: []
      });

      // Set shuffled items based on what's not solved
      const solvedItems = solvedGroups.flatMap(sg => sg.category.items);
      const remainingItems = getAllItems().filter(item => !solvedItems.includes(item));
      const allItemsInOrder = [...solvedItems, ...shuffleArray(remainingItems)];
      setGameState(prev => ({ ...prev, shuffledItems: allItemsInOrder }));
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
        shuffledItems: shuffleArray(getAllItems())
      });
    }

    // Check if we should show onboarding (only if puzzle exists and user hasn't seen it)
    if (!hasSeenOnboarding()) {
      setShowOnboarding(true);
    }

    endGameInit();
  }, [puzzle, getAllItems, reconstructSolvedGroupsFromHistory]);

  // Save progress whenever game state changes
  useEffect(() => {
    if (!gameState.puzzle) return;
    saveGameProgress(gameState.puzzle.id, gameState);
  }, [gameState]);

  const handleTileClick = (item: string) => {
    if (gameState.gameStatus !== 'playing') return;

    setGameState(prev => ({
      ...prev,
      selectedTiles: prev.selectedTiles.includes(item)
        ? prev.selectedTiles.filter(tile => tile !== item)
        : prev.selectedTiles.length < 4
          ? [...prev.selectedTiles, item]
          : prev.selectedTiles
    }));
  };

  const handleSubmit = async () => {
    if (gameState.selectedTiles.length !== 4 || gameState.gameStatus !== 'playing') return;

    const endGuessSubmit = trackGamePerformance.guessSubmit(gameState.selectedTiles);

    // Check if this combination matches any category
    const matchingCategory = puzzle.categories.find(category =>
      gameState.selectedTiles.every(tile => category.items.includes(tile)) &&
      category.items.every(item => gameState.selectedTiles.includes(item))
    );

    const newAttemptsUsed = gameState.attemptsUsed + 1;

    // Check if guess is "one away" from any category
    const isOneAway = !matchingCategory && puzzle.categories.some(category => {
      const matchCount = gameState.selectedTiles.filter(item => category.items.includes(item)).length;
      return matchCount === 3;
    });

    const guessResult: GuessResult = {
      items: [...gameState.selectedTiles],
      isCorrect: !!matchingCategory,
      isOneAway,
      category: matchingCategory,
      attemptNumber: newAttemptsUsed,
      itemDifficulties: gameState.selectedTiles.map(item => {
        const category = puzzle.categories.find(cat => cat.items.includes(item));
        return category?.difficulty || 1;
      })
    };

    const newGuessHistory = [...gameState.guessHistory, guessResult];

    if (matchingCategory) {
      // Correct guess
      const newSolvedGroup: SolvedGroup = {
        category: matchingCategory,
        solvedAt: gameState.solvedGroups.length
      };

      const newSolvedGroups = [...gameState.solvedGroups, newSolvedGroup];

      // Update available items
      const solvedItems = newSolvedGroups.flatMap(sg => sg.category.items);
      const remainingItems = getAllItems().filter(item => !solvedItems.includes(item));
      const allItemsInOrder = [...solvedItems, ...shuffleArray(remainingItems)];
      setGameState(prev => ({ ...prev, shuffledItems: allItemsInOrder }));

      const newGameStatus = newSolvedGroups.length === 4 ? 'won' : 'playing';

      setGameState(prev => ({
        ...prev,
        selectedTiles: [],
        solvedGroups: newSolvedGroups,
        attemptsUsed: newAttemptsUsed,
        gameStatus: newGameStatus,
        guessHistory: newGuessHistory,
        showToast: false,
        toastMessage: ''
      }));

      // Check if game is won
      if (newGameStatus === 'won') {
        if (!isPastPuzzle) {
          updateUserStats(true, puzzle.date);
        }
        setShowResults(true);
      }
    } else {
      // Wrong guess
      let showToast = false;
      let toastMessage = '';

      if (isOneAway) {
        // Show "one away" toast
        showToast = true;
        toastMessage = "One away...";
      }

      const newGameStatus = newAttemptsUsed >= maxGuesses ? 'lost' : 'playing';

      setGameState(prev => ({
        ...prev,
        selectedTiles: [],
        attemptsUsed: newAttemptsUsed,
        gameStatus: newGameStatus,
        guessHistory: newGuessHistory,
        showToast,
        toastMessage
      }));

      // Check if game is lost
      if (newGameStatus === 'lost') {
        if (!isPastPuzzle) {
          updateUserStats(false, puzzle.date);
        }
        setShowResults(true);
      }
    }

    endGuessSubmit();
  };

  const handleShuffle = () => {
    if (gameState.gameStatus !== 'playing') return;

    const solvedItems = gameState.solvedGroups.flatMap(sg => sg.category.items);
    const remainingItems = getAllItems().filter(item => !solvedItems.includes(item));
    const allItemsInOrder = [...solvedItems, ...shuffleArray(remainingItems)];
    setGameState(prev => ({ ...prev, shuffledItems: allItemsInOrder }));

    setGameState(prev => ({ ...prev, selectedTiles: [] }));
  };

  const handleDeselectAll = () => {
    setGameState(prev => ({ ...prev, selectedTiles: [] }));
  };

  const handleToastComplete = () => {
    setGameState(prev => ({ ...prev, showToast: false, toastMessage: '' }));
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    markOnboardingSeen();
  };



  return (
    <div className="max-w-md mx-auto p-4">
      <OnboardingModal
        isVisible={showOnboarding}
        onClose={handleOnboardingClose}
      />

      <div className="mb-6">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-1">
            {isPastPuzzle ? `Puzzle #${puzzleNumber}` : 'Daily Puzzle'}
          </p>
          <p className="text-sm text-gray-600">
            Find four groups of four!
          </p>
        </div>

        <div className="text-center mb-4">
          <span className="text-sm text-gray-500">
            Mistakes remaining: {maxGuesses - gameState.attemptsUsed}
          </span>
        </div>
      </div>

      <ErrorBoundary fallback={<GameErrorFallback />}>
        <SolvedGroups solvedGroups={gameState.solvedGroups} />

        <TileGrid
          gameState={gameState}
          onTileClick={handleTileClick}
          animatingTiles={[]}
          animationType={null}
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
    </div>
  );
}