import { v4 as uuidv4 } from 'uuid'
import { GameState, UserStats, GameProgress, GuessResult } from '@/types/game'

export function getOrCreateSessionId(): string {
  const key = 'frisconnections-session-id'
  let sessionId = localStorage.getItem(key)
  
  if (!sessionId) {
    sessionId = uuidv4()
    localStorage.setItem(key, sessionId)
  }
  
  return sessionId
}

export function saveGameProgress(puzzleId: number, gameState: Partial<GameState>) {
  const progress: GameProgress = {
    sessionId: getOrCreateSessionId(),
    puzzleId,
    selectedTiles: gameState.selectedTiles || [],
    solvedGroups: gameState.solvedGroups?.map(sg => sg.category.id) || [],
    attemptsUsed: gameState.attemptsUsed || 0,
    gameStatus: gameState.gameStatus || 'playing',
    guessHistory: gameState.guessHistory || [],
    timestamp: Date.now()
  }
  
  localStorage.setItem('frisconnections-progress', JSON.stringify(progress))
}

export function loadGameProgress(puzzleId: number): Partial<GameState> | null {
  const saved = localStorage.getItem('frisconnections-progress')
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
      guessHistory: progress.guessHistory
      // Note: solvedGroups will be reconstructed from guessHistory
    }
  } catch {
    return null
  }
}

export function clearGameProgress() {
  localStorage.removeItem('frisconnections-progress')
}

export function updateUserStats(won: boolean, date: string) {
  const stats = getUserStats()
  const today = new Date().toISOString().split('T')[0]
  
  stats.gamesPlayed++
  
  if (won) {
    stats.gamesWon++
    
    // Update streak
    if (stats.lastPlayedDate === getPreviousDate(today)) {
      stats.currentStreak++
    } else {
      stats.currentStreak = 1
    }
    
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak)
  } else {
    stats.currentStreak = 0
  }
  
  stats.lastPlayedDate = today
  localStorage.setItem('frisconnections-stats', JSON.stringify(stats))
}

export function getUserStats(): UserStats {
  const saved = localStorage.getItem('frisconnections-stats')
  if (!saved) {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: ''
    }
  }
  
  try {
    return JSON.parse(saved) as UserStats
  } catch {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: ''
    }
  }
}

function getPreviousDate(dateString: string): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}