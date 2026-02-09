'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import DifficultyBadge from '@/components/DifficultyBadge'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PastPuzzlesErrorFallback } from '@/components/ErrorFallbacks'
import { trackGamePerformance } from '@/lib/performance'
import { PuzzleCardSkeleton, SkeletonList } from '@/components/UI/Skeleton'

interface PastPuzzle {
  puzzle_number: number
  last_presented: string | null
  difficulty_tier?: number
}

export default function PastPuzzlesPage() {
  const [puzzles, setPuzzles] = useState<PastPuzzle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPuzzles = async () => {
      try {
        const response = await fetch('/api/past-puzzles')
        if (!response.ok) {
          throw new Error('Failed to fetch puzzles')
        }
        const data = await response.json()
        setPuzzles(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchPuzzles()
  }, [])

  // Memoize date formatter to prevent recreation on every render
  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return 'Never presented'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [])

  // Memoize formatted puzzle data to prevent recalculation on every render
  const formattedPuzzles = useMemo(() => {
    const endTracking = trackGamePerformance.dataFormat('puzzle_dates', puzzles.length)

    const formatted = puzzles.map(puzzle => ({
      ...puzzle,
      formattedDate: formatDate(puzzle.last_presented),
    }))

    endTracking()
    return formatted
  }, [puzzles, formatDate])

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Past FrisConnections</h1>

        <div className="mb-6 text-center">
          <Link
            href="/"
            className="px-4 py-2 bg-sf-navy text-white rounded-lg hover:bg-sf-navy-dark transition-colors"
          >
            Back to Today's Puzzle
          </Link>
        </div>

        <SkeletonList
          count={8}
          renderSkeleton={index => (
            <div className="mb-2">
              <PuzzleCardSkeleton />
            </div>
          )}
          staggerDelay={50}
          className="space-y-2"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Past FrisConnections</h1>

      <div className="mb-8 space-y-4 max-w-xl mx-auto">
        <p className="text-gray-700">
          Every puzzle in this archive was previously featured as the daily puzzle. Replay any past
          puzzle to test your San Francisco knowledge.
        </p>
        <p className="text-gray-700">
          Each puzzle contains 16 words organized into 4 categories with varying difficulty levels.
          Yellow categories are the most straightforward, while purple categories often involve
          wordplay or require deep local knowledge. New to the game?{' '}
          <Link href="/how-to-play" className="font-medium hover:underline text-sf-navy">
            Learn how to play
          </Link>
          .
        </p>
        <p className="text-gray-700">
          Your progress and stats for each puzzle are saved separately, so you can replay puzzles
          without affecting your daily game statistics. View your overall performance on the{' '}
          <Link href="/stats" className="font-medium hover:underline text-sf-navy">
            stats page
          </Link>
          .
        </p>
      </div>

      <div className="mb-6 text-center">
        <Link
          href="/"
          className="px-4 py-2 bg-sf-navy text-white rounded-lg hover:bg-sf-navy-dark transition-colors"
        >
          Back to Today's Puzzle
        </Link>
      </div>

      <ErrorBoundary fallback={<PastPuzzlesErrorFallback />}>
        <div className="space-y-2">
          {formattedPuzzles.map(puzzle => (
            <div
              key={puzzle.puzzle_number}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div>
                <h3 className="font-semibold">Puzzle #{puzzle.puzzle_number}</h3>
                <p className="text-sm text-gray-600">Last presented: {puzzle.formattedDate}</p>
                <DifficultyBadge tier={puzzle.difficulty_tier ?? null} />
              </div>
              <Link
                href={`/puzzle/${puzzle.puzzle_number}`}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Play
              </Link>
            </div>
          ))}
        </div>
      </ErrorBoundary>

      {puzzles.length === 0 && (
        <div className="text-center text-gray-600">No past puzzles available yet.</div>
      )}
    </div>
  )
}
