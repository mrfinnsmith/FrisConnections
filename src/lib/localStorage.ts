import { v4 as uuidv4 } from 'uuid'
import {
  GameState,
  UserStats,
  GameProgress,
  EnhancedUserStats,
  PuzzleResult,
  DifficultyStats,
} from '@/types/game'

export function getOrCreateSessionId(): string {
  const key = 'frisconnections-session-id'
  let sessionId = localStorage.getItem(key)

  if (!sessionId) {
    sessionId = uuidv4()
    localStorage.setItem(key, sessionId)
  }

  return sessionId
}

// Migrate old progress to new format if needed
function migrateOldProgress() {
  const oldKey = 'frisconnections-progress'
  const oldProgress = localStorage.getItem(oldKey)

  if (oldProgress) {
    try {
      const data = JSON.parse(oldProgress)
      if (data.puzzleId) {
        // Move to new puzzle-specific key
        const newKey = `frisconnections_puzzle_${data.puzzleId}_progress`
        localStorage.setItem(newKey, oldProgress)
        localStorage.removeItem(oldKey)
      }
    } catch {
      // If can't parse, just remove old data
      localStorage.removeItem(oldKey)
    }
  }
}

export function saveGameProgress(puzzleId: number, gameState: Partial<GameState>) {
  migrateOldProgress()

  const progress: GameProgress = {
    sessionId: getOrCreateSessionId(),
    puzzleId,
    selectedTiles: gameState.selectedTiles || [],
    solvedGroups: gameState.solvedGroups?.map(sg => sg.category.id) || [],
    attemptsUsed: gameState.attemptsUsed || 0,
    gameStatus: gameState.gameStatus || 'playing',
    guessHistory: gameState.guessHistory || [],
    timestamp: Date.now(),
  }

  const key = `frisconnections_puzzle_${puzzleId}_progress`
  localStorage.setItem(key, JSON.stringify(progress))
}

export function loadGameProgress(puzzleId: number): Partial<GameState> | null {
  migrateOldProgress()

  const key = `frisconnections_puzzle_${puzzleId}_progress`
  const saved = localStorage.getItem(key)
  if (!saved) return null

  try {
    const progress: GameProgress = JSON.parse(saved)
    if (progress.puzzleId !== puzzleId) return null

    // Check if progress is from today (don't restore old games)
    const isToday = new Date(progress.timestamp).toDateString() === new Date().toDateString()
    if (!isToday) return null

    return {
      selectedTiles: progress.selectedTiles,
      attemptsUsed: progress.attemptsUsed,
      gameStatus: progress.gameStatus,
      guessHistory: progress.guessHistory,
      // Note: solvedGroups will be reconstructed from guessHistory
    }
  } catch {
    return null
  }
}

export function clearGameProgress(puzzleId?: number) {
  if (puzzleId) {
    const key = `frisconnections_puzzle_${puzzleId}_progress`
    localStorage.removeItem(key)
  } else {
    // Clear old format for backwards compatibility
    localStorage.removeItem('frisconnections-progress')
  }
}

export function updateUserStats(
  won: boolean,
  puzzleId?: number,
  attemptsUsed?: number,
  solvedCategories?: { difficulty: number }[]
) {
  const stats = getUserStats()
  // Stats record when the user *played*, which is always now. This is
  // deliberately independent of any puzzle's presentation date: a replayed past
  // puzzle is still played today, so the play date is stamped here rather than
  // taken from the puzzle.
  const playedDate = new Date().toISOString().split('T')[0]

  stats.gamesPlayed++

  if (won) {
    stats.gamesWon++
  }

  stats.lastPlayedDate = playedDate
  localStorage.setItem('frisconnections-stats', JSON.stringify(stats))

  // Update enhanced stats if provided
  if (puzzleId !== undefined && attemptsUsed !== undefined) {
    updateEnhancedUserStats(puzzleId, playedDate, won, attemptsUsed, solvedCategories)
  }
}

export function getUserStats(): UserStats {
  const saved = localStorage.getItem('frisconnections-stats')
  if (!saved) {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      lastPlayedDate: '',
    }
  }

  try {
    return JSON.parse(saved) as UserStats
  } catch {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      lastPlayedDate: '',
    }
  }
}

// Onboarding system
const ONBOARDING_VERSION = 1
const ONBOARDING_KEY = 'frisconnections_onboarding_version'
const FIRST_INCORRECT_KEY = 'frisconnections_first_incorrect_shown'

export function hasSeenOnboarding(): boolean {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem(ONBOARDING_KEY)
  return saved === ONBOARDING_VERSION.toString()
}

export function markOnboardingSeen(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ONBOARDING_KEY, ONBOARDING_VERSION.toString())
}

export function hasSeenFirstIncorrectToast(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(FIRST_INCORRECT_KEY) === 'true'
}

export function markFirstIncorrectToastSeen(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(FIRST_INCORRECT_KEY, 'true')
}

// Enhanced Statistics Functions
export function updateEnhancedUserStats(
  puzzleId: number,
  date: string,
  won: boolean,
  attemptsUsed: number,
  solvedCategories?: { difficulty: number }[]
) {
  const enhancedStats = getEnhancedUserStats()

  // Add puzzle result to history
  const puzzleResult: PuzzleResult = {
    puzzleId,
    date,
    won,
    attemptsUsed,
  }

  // Remove any existing result for this puzzle (in case of replay)
  enhancedStats.puzzleHistory = enhancedStats.puzzleHistory.filter(p => p.puzzleId !== puzzleId)
  enhancedStats.puzzleHistory.push(puzzleResult)

  // Sort by puzzle ID (most recent first)
  enhancedStats.puzzleHistory.sort((a, b) => b.puzzleId - a.puzzleId)

  // Update difficulty breakdown. Every puzzle has exactly one category of each
  // difficulty, so each color is *presented* once per completed puzzle (that's
  // the `total`). A color's `won` counts the times the player solved that
  // specific category, independent of whether the whole puzzle was won.
  const solvedDifficulties = new Set((solvedCategories ?? []).map(cat => cat.difficulty))
  ;([1, 2, 3, 4] as const).forEach(difficulty => {
    const difficultyKey = getDifficultyKey(difficulty)
    if (!difficultyKey) return
    enhancedStats.difficultyBreakdown[difficultyKey].total++
    if (solvedDifficulties.has(difficulty)) {
      enhancedStats.difficultyBreakdown[difficultyKey].won++
    }
  })

  // Derive base counts from the history rather than incrementing counters, so a
  // replay (which replaces its history entry above) never inflates them and the
  // numbers always agree with the entries shown in the history list.
  enhancedStats.gamesPlayed = enhancedStats.puzzleHistory.length
  enhancedStats.gamesWon = enhancedStats.puzzleHistory.filter(p => p.won).length

  enhancedStats.lastPlayedDate = date
  enhancedStats.lastUpdated = new Date()

  localStorage.setItem(
    'frisconnections-enhanced-stats',
    JSON.stringify(enhancedStats, (key, value) => {
      if (key === 'lastUpdated') {
        return value instanceof Date ? value.toISOString() : value
      }
      return value
    })
  )
}

export function getEnhancedUserStats(): EnhancedUserStats {
  const saved = localStorage.getItem('frisconnections-enhanced-stats')

  if (!saved) {
    // Initialize with base stats if available
    const baseStats = getUserStats()
    return {
      ...baseStats,
      puzzleHistory: [],
      difficultyBreakdown: {
        yellow: { won: 0, total: 0 },
        green: { won: 0, total: 0 },
        blue: { won: 0, total: 0 },
        purple: { won: 0, total: 0 },
      },
      lastUpdated: new Date(),
    }
  }

  try {
    const parsed = JSON.parse(saved)
    // Convert lastUpdated back to Date object
    if (parsed.lastUpdated) {
      parsed.lastUpdated = new Date(parsed.lastUpdated)
    }
    return parsed as EnhancedUserStats
  } catch {
    // Return default if parsing fails
    const baseStats = getUserStats()
    return {
      ...baseStats,
      puzzleHistory: [],
      difficultyBreakdown: {
        yellow: { won: 0, total: 0 },
        green: { won: 0, total: 0 },
        blue: { won: 0, total: 0 },
        purple: { won: 0, total: 0 },
      },
      lastUpdated: new Date(),
    }
  }
}

export function validateStatsData(): { isValid: boolean; issues: string[] } {
  const issues: string[] = []

  try {
    const enhancedStats = getEnhancedUserStats()

    // Check for negative values
    if (enhancedStats.gamesPlayed < 0) issues.push('Negative games played')
    if (enhancedStats.gamesWon < 0) issues.push('Negative games won')
    if (enhancedStats.gamesWon > enhancedStats.gamesPlayed) {
      issues.push('Games won exceeds games played')
    }

    // Check difficulty breakdown totals
    Object.entries(enhancedStats.difficultyBreakdown).forEach(([difficulty, stats]) => {
      if (stats.won < 0) issues.push(`Negative ${difficulty} won count`)
      if (stats.total < 0) issues.push(`Negative ${difficulty} total count`)
      if (stats.won > stats.total) {
        issues.push(`${difficulty} won exceeds total`)
      }
    })

    // Check puzzle history for duplicates
    const puzzleIds = enhancedStats.puzzleHistory.map(p => p.puzzleId)
    const uniqueIds = new Set(puzzleIds)
    if (puzzleIds.length !== uniqueIds.size) {
      issues.push('Duplicate puzzle IDs in history')
    }

    return { isValid: issues.length === 0, issues }
  } catch (error) {
    return { isValid: false, issues: ['Failed to validate stats data'] }
  }
}

function getDifficultyKey(difficulty: number): keyof DifficultyStats | null {
  switch (difficulty) {
    case 1:
      return 'yellow'
    case 2:
      return 'green'
    case 3:
      return 'blue'
    case 4:
      return 'purple'
    default:
      return null
  }
}
