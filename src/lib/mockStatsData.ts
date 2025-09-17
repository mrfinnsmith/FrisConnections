import { EnhancedUserStats, PuzzleResult, DifficultyStats } from '@/types/game'

export const MOCK_PUZZLE_HISTORY: PuzzleResult[] = [
  { puzzleId: 47, date: '2025-01-15', won: true, attemptsUsed: 2 },
  { puzzleId: 46, date: '2025-01-14', won: false, attemptsUsed: 4 },
  { puzzleId: 45, date: '2025-01-13', won: true, attemptsUsed: 3 },
  { puzzleId: 44, date: '2025-01-12', won: true, attemptsUsed: 1 },
  { puzzleId: 43, date: '2025-01-11', won: true, attemptsUsed: 3 },
  { puzzleId: 42, date: '2025-01-10', won: false, attemptsUsed: 4 },
  { puzzleId: 41, date: '2025-01-09', won: true, attemptsUsed: 2 },
  { puzzleId: 40, date: '2025-01-08', won: true, attemptsUsed: 1 },
  { puzzleId: 39, date: '2025-01-07', won: true, attemptsUsed: 2 },
  { puzzleId: 38, date: '2025-01-06', won: false, attemptsUsed: 4 },
  { puzzleId: 37, date: '2025-01-05', won: true, attemptsUsed: 3 },
  { puzzleId: 36, date: '2025-01-04', won: true, attemptsUsed: 2 },
  { puzzleId: 35, date: '2025-01-03', won: true, attemptsUsed: 1 },
  { puzzleId: 34, date: '2025-01-02', won: false, attemptsUsed: 4 },
  { puzzleId: 33, date: '2025-01-01', won: true, attemptsUsed: 2 }
]

export const MOCK_DIFFICULTY_BREAKDOWN: DifficultyStats = {
  yellow: { won: 12, total: 15 }, // 80% - easiest
  green: { won: 10, total: 15 },  // 67% - medium-easy
  blue: { won: 7, total: 15 },    // 47% - medium-hard
  purple: { won: 3, total: 15 }   // 20% - hardest
}

export const MOCK_ENHANCED_STATS: EnhancedUserStats = {
  gamesPlayed: 15,
  gamesWon: 11,
  lastPlayedDate: '2025-01-15',
  puzzleHistory: MOCK_PUZZLE_HISTORY,
  difficultyBreakdown: MOCK_DIFFICULTY_BREAKDOWN,
  lastUpdated: new Date('2025-01-15T10:30:00Z')
}

// Helper function to generate additional mock data for testing different scenarios
export function generateMockStatsWithGames(gameCount: number): EnhancedUserStats {
  const puzzleHistory: PuzzleResult[] = []
  let gamesWon = 0
  
  const difficultyBreakdown: DifficultyStats = {
    yellow: { won: 0, total: 0 },
    green: { won: 0, total: 0 },
    blue: { won: 0, total: 0 },
    purple: { won: 0, total: 0 }
  }
  
  // Generate puzzle history (most recent first)
  for (let i = gameCount; i > 0; i--) {
    const puzzleId = 50 - i + 1
    const date = new Date()
    date.setDate(date.getDate() - i + 1)
    
    // Simulate realistic win rates: 73% overall
    const won = Math.random() < 0.73
    const attemptsUsed = won 
      ? Math.floor(Math.random() * 3) + 1  // 1-3 attempts if won
      : 4                                   // 4 attempts if lost
    
    puzzleHistory.push({
      puzzleId,
      date: date.toISOString().split('T')[0],
      won,
      attemptsUsed
    })
    
    if (won) {
      gamesWon++
    }
    
    // Add to difficulty breakdown (simulate each puzzle having 4 categories)
    const difficulties = [1, 2, 3, 4] as const
    difficulties.forEach(difficulty => {
      const key = ['yellow', 'green', 'blue', 'purple'][difficulty - 1] as keyof DifficultyStats
      difficultyBreakdown[key].total++
      
      // Simulate difficulty-based win rates
      const difficultyWinRate = difficulty === 1 ? 0.8 : difficulty === 2 ? 0.65 : difficulty === 3 ? 0.45 : 0.25
      if (won && Math.random() < difficultyWinRate) {
        difficultyBreakdown[key].won++
      }
    })
  }
  
  return {
    gamesPlayed: gameCount,
    gamesWon,
    lastPlayedDate: puzzleHistory[0]?.date || new Date().toISOString().split('T')[0],
    puzzleHistory,
    difficultyBreakdown,
    lastUpdated: new Date()
  }
}

// Different scenarios for testing progressive disclosure
export const SCENARIOS = {
  newUser: generateMockStatsWithGames(0),
  fewGames: generateMockStatsWithGames(3),
  someGames: generateMockStatsWithGames(10),
  manyGames: generateMockStatsWithGames(25),
  veteran: generateMockStatsWithGames(50)
}

// Helper for development mode to inject mock data
export function injectMockData(scenario: keyof typeof SCENARIOS = 'someGames') {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const mockData = SCENARIOS[scenario]
    localStorage.setItem('frisconnections-enhanced-stats', JSON.stringify(mockData, (key, value) => {
      if (key === 'lastUpdated') {
        return value instanceof Date ? value.toISOString() : value
      }
      return value
    }))
    console.log(`🎯 Injected mock stats data for scenario: ${scenario}`)
    console.log(`📊 Games: ${mockData.gamesPlayed}, Won: ${mockData.gamesWon}`)
  }
}