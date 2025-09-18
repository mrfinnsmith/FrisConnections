'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import GameBoard from '@/components/Game/GameBoard'
import GameBoardSkeleton from '@/components/Game/GameBoardSkeleton'
import { Puzzle } from '@/types/game'
import { Skeleton } from '@/components/UI/Skeleton'

interface PuzzlePageProps {
  params: { number: string }
}

export default function PuzzlePage({ params }: PuzzlePageProps) {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPuzzle = async () => {
      try {
        const response = await fetch(`/api/puzzle/${params.number}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Puzzle not found')
          }
          throw new Error('Failed to fetch puzzle')
        }
        const data = await response.json()
        setPuzzle(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchPuzzle()
  }, [params.number])

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="w-full max-w-lg mx-auto mb-6">
          <div className="text-center mb-4 space-y-2">
            <Skeleton height="h-8" width="w-32" className="mx-auto" />
            <Skeleton height="h-4" width="w-24" className="mx-auto" />
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <Skeleton height="h-10" width="w-28" rounded="lg" />
            <Skeleton height="h-10" width="w-32" rounded="lg" />
          </div>
        </div>

        {/* Game board skeleton */}
        <GameBoardSkeleton isPastPuzzle={true} />
      </div>
    )
  }

  if (error || !puzzle) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-6">{error || 'Puzzle not found'}</p>
          <Link
            href="/past"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Past Puzzles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-lg mx-auto mb-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Puzzle #{puzzle.puzzle_number}</h1>
          <p className="text-gray-600">Past FrisConnections</p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Today's Puzzle
          </Link>
          <Link
            href="/past"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            All Past Puzzles
          </Link>
        </div>
      </div>

      <GameBoard puzzle={puzzle} isPastPuzzle={true} puzzleNumber={parseInt(params.number)} />
    </div>
  )
}
