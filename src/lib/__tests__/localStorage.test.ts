import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveGameProgress,
  loadGameProgress,
  updateUserStats,
  getUserStats,
  getEnhancedUserStats,
  getOrCreateSessionId,
  hasSeenOnboarding,
  markOnboardingSeen,
} from '../localStorage'
import { GameState, UserStats } from '@/types/game'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('localStorage utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('saveGameProgress and loadGameProgress', () => {
    it('should save and load game progress', () => {
      const mockGameState: Partial<GameState> = {
        selectedTiles: ['Twin Peaks', 'Nob Hill'],
        attemptsUsed: 1,
        gameStatus: 'playing',
        guessHistory: [],
      }

      saveGameProgress(1, mockGameState as GameState)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frisconnections_puzzle_1_progress',
        expect.stringContaining('selectedTiles')
      )

      // Mock the return value for loading with the format that saveGameProgress actually saves
      const savedData = {
        sessionId: 'test-session',
        puzzleId: 1,
        selectedTiles: mockGameState.selectedTiles,
        attemptsUsed: mockGameState.attemptsUsed,
        gameStatus: mockGameState.gameStatus,
        guessHistory: mockGameState.guessHistory,
        solvedGroups: [],
        timestamp: new Date().toISOString(), // Must be today for the function to return data
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData))

      const loaded = loadGameProgress(1)
      expect(loaded?.selectedTiles).toEqual(mockGameState.selectedTiles)
      expect(loaded?.attemptsUsed).toEqual(mockGameState.attemptsUsed)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('frisconnections_puzzle_1_progress')
    })

    it('should return null for non-existent progress', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const loaded = loadGameProgress(999)
      expect(loaded).toBeNull()
    })

    it('should handle corrupted JSON gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const loaded = loadGameProgress(1)
      expect(loaded).toBeNull()
    })
  })

  describe('updateUserStats and getUserStats', () => {
    it('should update user stats after a win', () => {
      const initialStats: UserStats = {
        gamesPlayed: 5,
        gamesWon: 3,
        lastPlayedDate: '2025-01-01',
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(initialStats))

      updateUserStats(true)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frisconnections-stats',
        expect.stringContaining('"gamesPlayed":6')
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frisconnections-stats',
        expect.stringContaining('"gamesWon":4')
      )
    })

    it('should update user stats after a loss', () => {
      const initialStats: UserStats = {
        gamesPlayed: 5,
        gamesWon: 3,
        lastPlayedDate: '2025-01-01',
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(initialStats))

      updateUserStats(false)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frisconnections-stats',
        expect.stringContaining('"gamesPlayed":6')
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frisconnections-stats',
        expect.stringContaining('"gamesWon":3') // No change in wins
      )
    })

    it('should return default stats for new user', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const stats = getUserStats()

      expect(stats).toEqual({
        gamesPlayed: 0,
        gamesWon: 0,
        lastPlayedDate: '',
      })
    })

    it('should handle corrupted stats gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const stats = getUserStats()

      expect(stats).toEqual({
        gamesPlayed: 0,
        gamesWon: 0,
        lastPlayedDate: '',
      })
    })
  })

  describe('getOrCreateSessionId', () => {
    it('should return existing session ID', () => {
      localStorageMock.getItem.mockReturnValue('existing-session-id')

      const sessionId = getOrCreateSessionId()

      expect(sessionId).toBe('existing-session-id')
      expect(localStorageMock.getItem).toHaveBeenCalledWith('frisconnections-session-id')
    })

    it('should create new session ID if none exists', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const sessionId = getOrCreateSessionId()

      expect(typeof sessionId).toBe('string')
      expect(sessionId.length).toBeGreaterThan(0)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frisconnections-session-id',
        expect.any(String)
      )
    })
  })

  describe('onboarding state', () => {
    it('should return false for new user who hasnt seen onboarding', () => {
      localStorageMock.getItem.mockReturnValue(null)

      expect(hasSeenOnboarding()).toBe(false)
    })

    it('should return true for user who has seen onboarding', () => {
      localStorageMock.getItem.mockReturnValue('1')

      expect(hasSeenOnboarding()).toBe(true)
    })

    it('should mark onboarding as seen', () => {
      markOnboardingSeen()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frisconnections_onboarding_version',
        '1'
      )
    })
  })

  describe('enhanced stats recording', () => {
    // Back the mock with a real in-memory store so read-after-write works: the
    // enhanced-stats functions read the current value, mutate it, and write it
    // back across two keys.
    let store: Record<string, string>

    beforeEach(() => {
      store = {}
      localStorageMock.getItem.mockImplementation((key: string) =>
        key in store ? store[key] : null
      )
      localStorageMock.setItem.mockImplementation((key: string, value: string) => {
        store[key] = String(value)
      })
      localStorageMock.removeItem.mockImplementation((key: string) => {
        delete store[key]
      })
    })

    const allFourCategories = [
      { difficulty: 1 },
      { difficulty: 2 },
      { difficulty: 3 },
      { difficulty: 4 },
    ]

    it('records a single game played on the first finish', () => {
      updateUserStats(true, 20, 1, allFourCategories)

      const stats = getEnhancedUserStats()
      expect(stats.gamesPlayed).toBe(1)
      expect(stats.gamesWon).toBe(1)
      expect(stats.puzzleHistory).toHaveLength(1)
      expect(stats.puzzleHistory[0]).toMatchObject({ puzzleId: 20, won: true, attemptsUsed: 1 })
    })

    it('credits every solved color even on a loss and counts all four colors in the total', () => {
      // Player solved yellow and green, then ran out of guesses.
      updateUserStats(false, 21, 4, [{ difficulty: 1 }, { difficulty: 2 }])

      const { difficultyBreakdown } = getEnhancedUserStats()
      expect(difficultyBreakdown.yellow).toEqual({ won: 1, total: 1 })
      expect(difficultyBreakdown.green).toEqual({ won: 1, total: 1 })
      expect(difficultyBreakdown.blue).toEqual({ won: 0, total: 1 })
      expect(difficultyBreakdown.purple).toEqual({ won: 0, total: 1 })
    })

    it('does not duplicate history or inflate games played when a puzzle is replayed', () => {
      updateUserStats(false, 30, 4, [{ difficulty: 1 }])
      updateUserStats(true, 30, 2, allFourCategories)

      const stats = getEnhancedUserStats()
      expect(stats.puzzleHistory).toHaveLength(1)
      expect(stats.puzzleHistory[0]).toMatchObject({ puzzleId: 30, won: true, attemptsUsed: 2 })
      expect(stats.gamesPlayed).toBe(1)
      expect(stats.gamesWon).toBe(1)
    })
  })
})
