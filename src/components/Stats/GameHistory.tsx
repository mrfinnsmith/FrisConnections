'use client'

import { useState, useMemo } from 'react'
import { PuzzleResult } from '@/types/game'

interface GameHistoryProps {
  puzzleHistory: PuzzleResult[]
  showTitle?: boolean
}

const ITEMS_PER_PAGE = 10

export default function GameHistory({ puzzleHistory, showTitle = true }: GameHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(puzzleHistory.length / ITEMS_PER_PAGE)

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return puzzleHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [puzzleHistory, currentPage])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getAttemptsDisplay = (attemptsUsed: number, won: boolean) => {
    if (!won) return 'Lost'
    return `${attemptsUsed}/4`
  }

  const getResultColor = (won: boolean) => {
    return won ? 'text-green-600' : 'text-red-600'
  }

  const getResultEmoji = (won: boolean) => {
    return won ? '✅' : '❌'
  }

  if (puzzleHistory.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">Game History</h3>}
        <div className="text-center py-4">
          <p className="text-gray-600 mb-1">No games played yet</p>
          <p className="text-sm text-gray-500">Your puzzle history will appear here as you play.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Game History</h3>
          <span className="text-sm text-gray-500">{puzzleHistory.length} games played</span>
        </div>
      )}

      {/* History table */}
      <div className="space-y-2">
        {paginatedHistory.map(puzzle => (
          <div
            key={puzzle.puzzleId}
            className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <span className="text-lg">{getResultEmoji(puzzle.won)}</span>
              <div>
                <div className="font-medium text-gray-900">Puzzle #{puzzle.puzzleId}</div>
                <div className="text-sm text-gray-600">{formatDate(puzzle.date)}</div>
              </div>
            </div>

            <div className="text-right">
              <div className={`font-semibold ${getResultColor(puzzle.won)}`}>
                {getAttemptsDisplay(puzzle.attemptsUsed, puzzle.won)}
              </div>
              {puzzle.won && (
                <div className="text-xs text-gray-500">
                  {puzzle.attemptsUsed === 1
                    ? 'Perfect!'
                    : puzzle.attemptsUsed === 2
                      ? 'Great!'
                      : puzzle.attemptsUsed === 3
                        ? 'Good'
                        : 'Close call'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6 pt-4 border-t">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Summary stats for users with many games */}
      {puzzleHistory.length >= 10 && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Perfect games:</span>
              <span className="font-medium">
                {puzzleHistory.filter(p => p.won && p.attemptsUsed === 1).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Close calls:</span>
              <span className="font-medium">
                {puzzleHistory.filter(p => p.won && p.attemptsUsed === 4).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
