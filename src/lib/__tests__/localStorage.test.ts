import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveGameProgress,
  loadGameProgress,
  updateUserStats,
  getUserStats,
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

      updateUserStats(true, '2025-01-02')

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

      updateUserStats(false, '2025-01-02')

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
})
