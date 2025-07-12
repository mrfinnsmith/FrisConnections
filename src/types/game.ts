export interface GameState {
  puzzle: Puzzle | null
  selectedTiles: string[]
  solvedGroups: SolvedGroup[]
  attemptsUsed: number
  gameStatus: 'playing' | 'won' | 'lost'
  guessHistory: GuessResult[]
}

export interface Puzzle {
  id: number
  date: string
  puzzle_number: number
  categories: Category[]
}

export interface Category {
  id: number
  name: string
  difficulty: 1 | 2 | 3 | 4
  items: string[]
}

export interface SolvedGroup {
  category: Category
  solvedAt: number
}

export interface GuessResult {
  items: string[]
  isCorrect: boolean
  category?: Category
  attemptNumber: number
  itemDifficulties: number[]
}

export interface UserStats {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  maxStreak: number
  lastPlayedDate: string
}

export interface GameProgress {
  sessionId: string
  puzzleId: number
  selectedTiles: string[]
  solvedGroups: number[]
  attemptsUsed: number
  gameStatus: 'playing' | 'won' | 'lost'
  guessHistory: GuessResult[]
  timestamp: number
}

export const DIFFICULTY_COLORS = {
  1: '#f59e0b', // Yellow
  2: '#10b981', // Green  
  3: '#3b82f6', // Blue
  4: '#8b5cf6'  // Purple
} as const

export const DIFFICULTY_EMOJI = {
  1: '🟨', // Yellow
  2: '🟩', // Green
  3: '🟦', // Blue
  4: '🟪'  // Purple
} as const

export const DIFFICULTY_NAMES = {
  1: 'Yellow',
  2: 'Green',
  3: 'Blue',
  4: 'Purple'
} as const

export const MAX_ATTEMPTS = 4
export const TILES_PER_GROUP = 4
export const TOTAL_TILES = 16