import { GameState, Puzzle, Category, GuessResult, SolvedGroup, TILES_PER_GROUP, MAX_ATTEMPTS } from '@/types/game'
import { recordGuess, updateSession, completeSession } from './session_api'

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function createInitialGameState(puzzle: Puzzle, sessionId?: string): GameState {
  return {
    puzzle,
    selectedTiles: [],
    solvedGroups: [],
    attemptsUsed: 0,
    gameStatus: 'playing',
    guessHistory: [],
    sessionId,
    showToast: false,
    toastMessage: "",
    shuffledItems: getShuffledTiles(puzzle)
  }
}

export function getAllTiles(puzzle: Puzzle): string[] {
  return puzzle.categories.flatMap(category => category.items)
}

export function getShuffledTiles(puzzle: Puzzle): string[] {
  return shuffleArray(getAllTiles(puzzle))
}

export function findCategoryByItems(puzzle: Puzzle, items: string[]): Category | null {
  const sortedItems = [...items].sort()

  return puzzle.categories.find(category => {
    const sortedCategoryItems = [...category.items].sort()
    return sortedItems.length === sortedCategoryItems.length &&
      sortedItems.every((item, index) => item === sortedCategoryItems[index])
  }) || null
}

export function checkOneAway(puzzle: Puzzle, selectedItems: string[]): boolean {
  for (const category of puzzle.categories) {
    const matchCount = selectedItems.filter(item =>
      category.items.includes(item)
    ).length;

    if (matchCount === 3) {
      return true;
    }
  }
  return false;
}

export async function makeGuess(
  gameState: GameState,
  selectedItems: string[]
): Promise<{ newGameState: GameState; isCorrect: boolean; category?: Category }> {
  if (!gameState.puzzle || selectedItems.length !== TILES_PER_GROUP) {
    return { newGameState: gameState, isCorrect: false }
  }

  const category = findCategoryByItems(gameState.puzzle, selectedItems)
  const isCorrect = category !== null
  const isOneAway = !isCorrect && checkOneAway(gameState.puzzle, selectedItems)
  const newAttemptsUsed = isCorrect ? gameState.attemptsUsed : gameState.attemptsUsed + 1
  const attemptNumber = newAttemptsUsed

  // Get item difficulties for the guess
  const itemDifficulties = selectedItems.map(item => {
    const cat = gameState.puzzle!.categories.find(c => c.items.includes(item))
    return cat?.difficulty || 1
  })

  const guessResult: GuessResult = {
    items: selectedItems,
    isCorrect,
    isOneAway,
    category: category || undefined,
    attemptNumber,
    itemDifficulties
  }

  const newGuessHistory = [...gameState.guessHistory, guessResult]
  let newSolvedGroups = [...gameState.solvedGroups]
  let newGameStatus = gameState.gameStatus

  if (isCorrect && category) {
    // Add to solved groups
    newSolvedGroups.push({
      category,
      solvedAt: Date.now()
    })

    // Check if all groups are solved
    if (newSolvedGroups.length === gameState.puzzle.categories.length) {
      newGameStatus = 'won'
    }
  } else {
    // Check if max attempts reached
    if (newAttemptsUsed >= MAX_ATTEMPTS) {
      newGameStatus = 'lost'
    }
  }

  const newGameState: GameState = {
    ...gameState,
    selectedTiles: isCorrect ? [] : gameState.selectedTiles,
    solvedGroups: newSolvedGroups,
    attemptsUsed: newAttemptsUsed,
    gameStatus: newGameStatus,
    guessHistory: newGuessHistory,
    showToast: isOneAway,
    toastMessage: isOneAway ? "One away..." : ""
  }

  // Record guess in database if session tracking is enabled
  if (gameState.sessionId) {
    await recordGuess({
      session_id: gameState.sessionId,
      puzzle_id: gameState.puzzle.id,
      guessed_items: selectedItems,
      item_difficulties: itemDifficulties,
      is_correct: isCorrect,
      category_id: category?.id,
      attempt_number: attemptNumber
    })

    // Update session progress
    await updateSession(gameState.sessionId, {
      attempts_used: newAttemptsUsed,
      solved_categories: newSolvedGroups.map(sg => sg.category.id)
    })

    // Complete session if game is over
    if (newGameStatus === 'won' || newGameStatus === 'lost') {
      await completeSession(
        gameState.sessionId,
        newAttemptsUsed,
        newSolvedGroups.map(sg => sg.category.id)
      )
    }
  }

  return { newGameState, isCorrect, category: category || undefined }
}

export function getAvailableTiles(gameState: GameState): string[] {
  if (!gameState.puzzle) return []

  const solvedItems = gameState.solvedGroups.flatMap(group => group.category.items)
  return getAllTiles(gameState.puzzle).filter(item => !solvedItems.includes(item))
}

export function canSelectTile(gameState: GameState, tile: string): boolean {
  if (gameState.gameStatus !== 'playing') return false

  const availableTiles = getAvailableTiles(gameState)
  const isAvailable = availableTiles.includes(tile)
  const isAlreadySelected = gameState.selectedTiles.includes(tile)
  const hasRoomForSelection = gameState.selectedTiles.length < TILES_PER_GROUP

  return isAvailable && (isAlreadySelected || hasRoomForSelection)
}

export function toggleTileSelection(gameState: GameState, tile: string): GameState {
  if (!canSelectTile(gameState, tile)) return gameState

  const isSelected = gameState.selectedTiles.includes(tile)
  let newSelectedTiles: string[]

  if (isSelected) {
    // Deselect the tile
    newSelectedTiles = gameState.selectedTiles.filter(t => t !== tile)
  } else {
    // Select the tile (if we have room)
    if (gameState.selectedTiles.length < TILES_PER_GROUP) {
      newSelectedTiles = [...gameState.selectedTiles, tile]
    } else {
      // Can't select more tiles
      return gameState
    }
  }

  return {
    ...gameState,
    selectedTiles: newSelectedTiles
  }
}

export function canSubmitGuess(gameState: GameState): boolean {
  return gameState.gameStatus === 'playing' &&
    gameState.selectedTiles.length === TILES_PER_GROUP
}

export function getRemainingAttempts(gameState: GameState): number {
  return Math.max(0, MAX_ATTEMPTS - gameState.attemptsUsed)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}