'use client'

import { useMemo } from 'react'
import { DifficultyStats } from '@/types/game'
import { DIFFICULTY_COLORS } from '@/types/game'

interface DifficultyBreakdownProps {
  difficultyBreakdown: DifficultyStats
  showTitle?: boolean
}

interface DifficultyRow {
  name: string
  color: string
  emoji: string
  won: number
  total: number
  percentage: number
}

export default function DifficultyBreakdown({ difficultyBreakdown, showTitle = true }: DifficultyBreakdownProps) {
  const difficultyRows = useMemo((): DifficultyRow[] => {
    return [
      {
        name: 'Yellow (Easiest)',
        color: DIFFICULTY_COLORS[1],
        emoji: '🟨',
        won: difficultyBreakdown.yellow.won,
        total: difficultyBreakdown.yellow.total,
        percentage: difficultyBreakdown.yellow.total === 0 ? 0 : Math.round((difficultyBreakdown.yellow.won / difficultyBreakdown.yellow.total) * 100)
      },
      {
        name: 'Green',
        color: DIFFICULTY_COLORS[2], 
        emoji: '🟩',
        won: difficultyBreakdown.green.won,
        total: difficultyBreakdown.green.total,
        percentage: difficultyBreakdown.green.total === 0 ? 0 : Math.round((difficultyBreakdown.green.won / difficultyBreakdown.green.total) * 100)
      },
      {
        name: 'Blue',
        color: DIFFICULTY_COLORS[3],
        emoji: '🟦',
        won: difficultyBreakdown.blue.won,
        total: difficultyBreakdown.blue.total,
        percentage: difficultyBreakdown.blue.total === 0 ? 0 : Math.round((difficultyBreakdown.blue.won / difficultyBreakdown.blue.total) * 100)
      },
      {
        name: 'Purple (Hardest)',
        color: DIFFICULTY_COLORS[4],
        emoji: '🟪',
        won: difficultyBreakdown.purple.won,
        total: difficultyBreakdown.purple.total,
        percentage: difficultyBreakdown.purple.total === 0 ? 0 : Math.round((difficultyBreakdown.purple.won / difficultyBreakdown.purple.total) * 100)
      }
    ]
  }, [difficultyBreakdown])

  const hasAnyData = difficultyRows.some(row => row.total > 0)

  if (!hasAnyData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Breakdown</h3>}
        <div className="text-center py-4">
          <p className="text-gray-600 mb-1">No difficulty data yet</p>
          <p className="text-sm text-gray-500">Complete some puzzles to see your performance by difficulty level.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Breakdown</h3>}
      
      <div className="space-y-3">
        {difficultyRows.map((row) => (
          <div key={row.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{row.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{row.name}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Win/Total count */}
              <span className="text-sm text-gray-600 min-w-[3rem] text-right">
                {row.total > 0 ? `${row.won}/${row.total}` : '—'}
              </span>
              
              {/* Percentage */}
              <span className={`text-sm font-semibold min-w-[3rem] text-right ${
                row.percentage >= 70 ? 'text-green-600' :
                row.percentage >= 50 ? 'text-yellow-600' :
                row.percentage >= 30 ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {row.total > 0 ? `${row.percentage}%` : '—'}
              </span>
              
              {/* Progress bar */}
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                {row.total > 0 && (
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${row.percentage}%`,
                      backgroundColor: row.color,
                      opacity: 0.8
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Helpful note for users */}
      <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded p-3">
        <p><strong>Tip:</strong> Each puzzle has 4 categories (one of each color). Yellow categories are designed to be easiest, purple are hardest.</p>
      </div>
    </div>
  )
}