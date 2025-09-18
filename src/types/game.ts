export interface GameState {
  puzzle: Puzzle | null
  selectedTiles: string[]
  solvedGroups: SolvedGroup[]
  attemptsUsed: number
  gameStatus: 'playing' | 'won' | 'lost'
  guessHistory: GuessResult[]
  sessionId?: string
  showToast: boolean
  toastMessage: string
  shuffledItems: string[]
}

export interface Puzzle {
  id: number
  date: string
  puzzle_number: number
  categories: Category[]
  difficulty_tier?: 1 | 2 | 3
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
  isOneAway?: boolean
  category?: Category
  attemptNumber: number
  itemDifficulties: number[]
}

export interface UserStats {
  gamesPlayed: number
  gamesWon: number
  lastPlayedDate: string
}

export interface PuzzleResult {
  puzzleId: number
  date: string
  won: boolean
  attemptsUsed: number
}

export interface DifficultyStats {
  yellow: { won: number; total: number }
  green: { won: number; total: number }
  blue: { won: number; total: number }
  purple: { won: number; total: number }
}

export interface EnhancedUserStats extends UserStats {
  puzzleHistory: PuzzleResult[]
  difficultyBreakdown: DifficultyStats
  lastUpdated: Date
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

// New session tracking types
export interface SessionData {
  session_id: string
  puzzle_id: number
  completed: boolean
  attempts_used: number
  solved_categories: number[]
  start_time: string
  end_time?: string
}

export interface GuessData {
  session_id: string
  puzzle_id: number
  guessed_items: string[]
  item_difficulties: number[]
  is_correct: boolean
  category_id?: number
  attempt_number: number
}

export const DIFFICULTY_COLORS = {
  1: '#f9df6d', // Yellow
  2: '#a0c35a', // Green
  3: '#b0c4ef', // Blue
  4: '#ba81c5', // Purple
} as const

export const DIFFICULTY_EMOJI = {
  1: '🟨', // Yellow
  2: '🟩', // Green
  3: '🟦', // Blue
  4: '🟪', // Purple
} as const

export const DIFFICULTY_NAMES = {
  1: 'Yellow',
  2: 'Green',
  3: 'Blue',
  4: 'Purple',
} as const

export const DIFFICULTY_TIER_NAMES = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
} as const

export const DIFFICULTY_TIER_COLORS = {
  1: 'bg-green-100 text-green-800 border border-green-200',
  2: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  3: 'bg-red-100 text-red-800 border border-red-200',
} as const

export const MAX_ATTEMPTS = 4
export const TILES_PER_GROUP = 4
export const TOTAL_TILES = 16
