'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StatsOverview from '@/components/Stats/StatsOverview'
import DifficultyBreakdown from '@/components/Stats/DifficultyBreakdown'
import GameHistory from '@/components/Stats/GameHistory'
import { getEnhancedUserStats, validateStatsData } from '@/lib/localStorage'
import { injectMockData } from '@/lib/mockStatsData'
import { EnhancedUserStats } from '@/types/game'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { StatsErrorFallback } from '@/components/ErrorFallbacks'

export default function StatsPage() {
  const [stats, setStats] = useState<EnhancedUserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [validationIssues, setValidationIssues] = useState<string[]>([])
  const [showDeveloperTools, setShowDeveloperTools] = useState(false)

  useEffect(() => {
    const loadStats = () => {
      try {
        const userStats = getEnhancedUserStats()
        setStats(userStats)

        // Validate data integrity
        const validation = validateStatsData()
        if (!validation.isValid) {
          setValidationIssues(validation.issues)
          console.warn('Stats validation issues:', validation.issues)
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  // Development tools
  const handleInjectMockData = (scenario: string) => {
    injectMockData(scenario as any)
    window.location.reload()
  }

  const clearAllData = () => {
    if (confirm('Clear all statistics data? This cannot be undone.')) {
      localStorage.removeItem('frisconnections-enhanced-stats')
      localStorage.removeItem('frisconnections-stats')
      window.location.reload()
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Error Loading Stats</h1>
        <p className="text-gray-600 mb-6">
          We couldn't load your statistics. Please try refreshing the page.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-sf-navy text-white rounded-lg hover:bg-sf-navy-dark transition-colors"
        >
          Back to Game
        </Link>
      </div>
    )
  }

  // Progressive disclosure based on games played
  const showDifficultyBreakdown = stats.gamesPlayed >= 3
  const showGameHistory = stats.gamesPlayed >= 1
  const showAdvancedStats = stats.gamesPlayed >= 10

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Statistics</h1>
        <p className="text-gray-600">Track your FrisConnections performance over time</p>
      </div>

      <div className="mb-6 flex justify-center gap-4">
        <Link
          href="/"
          className="px-4 py-2 bg-sf-navy text-white rounded-lg hover:bg-sf-navy-dark transition-colors"
        >
          Today's Puzzle
        </Link>
        <Link
          href="/past"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Past Puzzles
        </Link>
      </div>

      {/* Data validation warnings */}
      {validationIssues.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Data Integrity Issues Detected</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            {validationIssues.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      <ErrorBoundary fallback={<StatsErrorFallback />}>
        <div className="space-y-8">
          {/* Always show overview */}
          <StatsOverview stats={stats} />

          {/* Show difficulty breakdown after 3+ games */}
          {showDifficultyBreakdown && (
            <DifficultyBreakdown difficultyBreakdown={stats.difficultyBreakdown} />
          )}

          {/* Show game history after 1+ games */}
          {showGameHistory && <GameHistory puzzleHistory={stats.puzzleHistory} />}

          {stats.gamesPlayed > 0 && stats.gamesPlayed < 3 && (
            <div className="text-center py-6 bg-green-50 rounded-lg">
              <p className="text-green-700">
                Great start! Play {3 - stats.gamesPlayed} more games to unlock difficulty breakdown
                analysis.
              </p>
            </div>
          )}

          {stats.gamesPlayed >= 3 && stats.gamesPlayed < 10 && (
            <div className="text-center py-6 bg-purple-50 rounded-lg">
              <p className="text-purple-700">
                You're building a nice streak! Play {10 - stats.gamesPlayed} more games to unlock
                advanced statistics.
              </p>
            </div>
          )}

          {/* Advanced stats for experienced players */}
          {showAdvancedStats && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">
                🎉 Advanced Player Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-purple-700">
                    {stats.puzzleHistory.filter(p => p.won && p.attemptsUsed === 1).length}
                  </div>
                  <div className="text-purple-600">Perfect Games</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-700">
                    {Math.round(
                      (stats.puzzleHistory.filter(p => p.won).length /
                        Math.max(stats.puzzleHistory.length, 1)) *
                        100
                    )}
                    %
                  </div>
                  <div className="text-purple-600">Overall Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-700">
                    {stats.puzzleHistory.slice(0, 10).filter(p => p.won).length}/10
                  </div>
                  <div className="text-purple-600">Recent Form</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-700">
                    {Math.round(
                      (stats.puzzleHistory.reduce((sum, p) => sum + p.attemptsUsed, 0) /
                        Math.max(stats.puzzleHistory.length, 1)) *
                        10
                    ) / 10}
                  </div>
                  <div className="text-purple-600">Avg. Attempts</div>
                </div>
              </div>
            </div>
          )}

          {/* Developer tools in development mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <button
                onClick={() => setShowDeveloperTools(!showDeveloperTools)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                🛠️ Developer Tools {showDeveloperTools ? '(Hide)' : '(Show)'}
              </button>

              {showDeveloperTools && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-600 mb-3">
                    Inject mock data for testing different scenarios:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['newUser', 'fewGames', 'someGames', 'manyGames', 'veteran'].map(scenario => (
                      <button
                        key={scenario}
                        onClick={() => handleInjectMockData(scenario)}
                        className="px-3 py-1 text-xs bg-sf-navy-light text-sf-navy-dark rounded hover:bg-blue-200"
                      >
                        {scenario}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={clearAllData}
                    className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Clear All Data
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </div>
  )
}
