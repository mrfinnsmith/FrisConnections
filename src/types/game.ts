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
  4: '#ba81c5'  // Purple
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