import { describe, it, expect } from 'vitest'
import {
  shuffleArray,
  getAvailableTiles,
  findCategoryByItems,
  checkOneAway,
  createInitialGameState,
  getAllTiles,
  getShuffledTiles,
  canSelectTile,
  toggleTileSelection,
  canSubmitGuess,
  getRemainingAttempts,
} from '../gameLogic'
import { GameState, Puzzle, Category } from '@/types/game'

// Mock puzzle data for testing
const mockCategories: Category[] = [
  {
    id: 1,
    name: 'SF Hills',
    difficulty: 1,
    items: ['Twin Peaks', 'Nob Hill', 'Russian Hill', 'Telegraph Hill'],
    puzzle_id: 1,
  },
  {
    id: 2,
    name: 'Tech Companies',
    difficulty: 2,
    items: ['Oracle', 'Salesforce', 'Uber', 'Twitter'],
    puzzle_id: 1,
  },
  {
    id: 3,
    name: 'MUNI Lines',
    difficulty: 3,
    items: ['N Judah', 'L Taraval', 'K Ingleside', 'M Ocean View'],
    puzzle_id: 1,
  },
  {
    id: 4,
    name: 'Food Invented in SF',
    difficulty: 4,
    items: ['Irish Coffee', 'Sourdough', 'Mission Burrito', 'Cioppino'],
    puzzle_id: 1,
  },
]

const mockPuzzle: Puzzle = {
  id: 1,
  puzzle_number: 1,
  date: '2025-01-01',
  categories: mockCategories,
  published: true,
  created_at: '2025-01-01T00:00:00Z',
}

describe('gameLogic', () => {
  describe('shuffleArray', () => {
    it('should return array with same elements', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffleArray([...original])

      expect(shuffled).toHaveLength(original.length)
      expect(shuffled.sort()).toEqual(original.sort()) // Same elements, possibly different order
    })
  })

  describe('getAllTiles', () => {
    it('should return all 16 tiles from puzzle categories', () => {
      const tiles = getAllTiles(mockPuzzle)

      expect(tiles).toHaveLength(16)
      expect(tiles).toContain('Twin Peaks')
      expect(tiles).toContain('Oracle')
      expect(tiles).toContain('N Judah')
      expect(tiles).toContain('Irish Coffee')
    })
  })

  describe('getShuffledTiles', () => {
    it('should return shuffled tiles', () => {
      const shuffled = getShuffledTiles(mockPuzzle)

      expect(shuffled).toHaveLength(16)
      expect(shuffled).toContain('Twin Peaks')
    })
  })

  describe('findCategoryByItems', () => {
    it('should find category for exact match', () => {
      const items = ['Twin Peaks', 'Nob Hill', 'Russian Hill', 'Telegraph Hill']
      const category = findCategoryByItems(mockPuzzle, items)

      expect(category?.name).toBe('SF Hills')
      expect(category?.difficulty).toBe(1)
    })

    it('should return null for incorrect items', () => {
      const items = ['Twin Peaks', 'Oracle', 'N Judah', 'Irish Coffee']
      const category = findCategoryByItems(mockPuzzle, items)

      expect(category).toBeNull()
    })
  })

  describe('checkOneAway', () => {
    it('should detect one-away guesses', () => {
      const items = ['Twin Peaks', 'Nob Hill', 'Russian Hill', 'Oracle'] // 3/4 correct
      const isOneAway = checkOneAway(mockPuzzle, items)

      expect(isOneAway).toBe(true)
    })

    it('should not detect one-away for 2/4 or less matches', () => {
      const items = ['Twin Peaks', 'Nob Hill', 'Oracle', 'N Judah'] // 2/4 correct
      const isOneAway = checkOneAway(mockPuzzle, items)

      expect(isOneAway).toBe(false)
    })
  })

  describe('createInitialGameState', () => {
    it('should create valid initial game state', () => {
      const gameState = createInitialGameState(mockPuzzle, 'test-session')

      expect(gameState.puzzle).toEqual(mockPuzzle)
      expect(gameState.selectedTiles).toEqual([])
      expect(gameState.solvedGroups).toEqual([])
      expect(gameState.attemptsUsed).toBe(0)
      expect(gameState.gameStatus).toBe('playing')
      expect(gameState.sessionId).toBe('test-session')
      expect(gameState.shuffledItems).toHaveLength(16)
    })
  })

  describe('getAvailableTiles', () => {
    it('should return all tiles when no groups solved', () => {
      const gameState = createInitialGameState(mockPuzzle)
      const available = getAvailableTiles(gameState)

      expect(available).toHaveLength(16)
      expect(available).toContain('Twin Peaks')
      expect(available).toContain('Oracle')
    })

    it('should exclude solved group items', () => {
      const gameState = createInitialGameState(mockPuzzle)
      gameState.solvedGroups = [
        { category: mockCategories[0], solvedAt: 0 }, // SF Hills solved
      ]

      const available = getAvailableTiles(gameState)
      expect(available).toHaveLength(12)
      expect(available).not.toContain('Twin Peaks')
      expect(available).not.toContain('Nob Hill')
      expect(available).toContain('Oracle') // Still available
    })
  })

  describe('tile selection logic', () => {
    let gameState: GameState

    beforeEach(() => {
      gameState = createInitialGameState(mockPuzzle, 'test-session')
    })

    it('should allow selecting available tiles', () => {
      expect(canSelectTile(gameState, 'Twin Peaks')).toBe(true)
    })

    it('should toggle tile selection', () => {
      const newState = toggleTileSelection(gameState, 'Twin Peaks')
      expect(newState.selectedTiles).toContain('Twin Peaks')

      const toggledBack = toggleTileSelection(newState, 'Twin Peaks')
      expect(toggledBack.selectedTiles).not.toContain('Twin Peaks')
    })

    it('should allow submitting when 4 tiles selected', () => {
      gameState.selectedTiles = ['Twin Peaks', 'Nob Hill', 'Russian Hill', 'Telegraph Hill']
      expect(canSubmitGuess(gameState)).toBe(true)
    })

    it('should not allow submitting with wrong number of tiles', () => {
      gameState.selectedTiles = ['Twin Peaks', 'Nob Hill']
      expect(canSubmitGuess(gameState)).toBe(false)
    })

    it('should calculate remaining attempts correctly', () => {
      expect(getRemainingAttempts(gameState)).toBe(4)

      gameState.attemptsUsed = 2
      expect(getRemainingAttempts(gameState)).toBe(2)
    })
  })
})
