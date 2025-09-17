'use client'

import { useMemo } from 'react'
import { EnhancedUserStats } from '@/types/game'

interface StatsOverviewProps {
  stats: EnhancedUserStats
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const winRate = useMemo(() => {
    if (stats.gamesPlayed === 0) return 0
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
  }, [stats.gamesPlayed, stats.gamesWon])

  const averageAttempts = useMemo(() => {
    if (stats.puzzleHistory.length === 0) return 0
    const totalAttempts = stats.puzzleHistory.reduce((sum, puzzle) => sum + puzzle.attemptsUsed, 0)
    return Math.round((totalAttempts / stats.puzzleHistory.length) * 10) / 10
  }, [stats.puzzleHistory])

  const recentWins = useMemo(() => {
    const recent10 = stats.puzzleHistory.slice(0, 10)
    return recent10.filter(puzzle => puzzle.won).length
  }, [stats.puzzleHistory])


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Your FrisConnections Stats</h2>
      
      {stats.gamesPlayed === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-2">No games played yet!</p>
          <p className="text-sm text-gray-500">Start playing to build your statistics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Games Played */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.gamesPlayed}</div>
            <div className="text-sm text-gray-600">Games Played</div>
          </div>

          {/* Win Rate */}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{winRate}%</div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>

          {/* Average Attempts */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{averageAttempts}</div>
            <div className="text-sm text-gray-600">Avg. Attempts</div>
          </div>

          {/* Recent Performance */}
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{recentWins}/10</div>
            <div className="text-sm text-gray-600">Recent Wins</div>
          </div>
        </div>
      )}


      {/* Last played info */}
      {stats.lastPlayedDate && (
        <div className="text-xs text-gray-500 text-center border-t pt-3">
          Last played: {new Date(stats.lastPlayedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      )}
    </div>
  )
}