import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import GameBoard from '@/components/Game/GameBoard'
import { Puzzle } from '@/types/game'

export const revalidate = 86400

interface PuzzlePageProps {
  params: { number: string }
}

async function getPuzzle(puzzleNumber: number): Promise<Puzzle | null> {
  const { data, error } = await supabase.rpc('frisc_get_puzzle_by_number', {
    puzzle_num: puzzleNumber,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data || null
}

export default async function PuzzlePage({ params }: PuzzlePageProps) {
  const puzzleNumber = parseInt(params.number)

  if (isNaN(puzzleNumber)) {
    notFound()
  }

  const puzzle = await getPuzzle(puzzleNumber)

  if (!puzzle) {
    notFound()
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
            className="px-4 py-2 bg-sf-navy text-white rounded-lg hover:bg-sf-navy-dark transition-colors"
          >
            Today's Puzzle
          </Link>
          <Link
            href="/archive"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            All Past Puzzles
          </Link>
        </div>
      </div>

      <GameBoard puzzle={puzzle} isPastPuzzle={true} puzzleNumber={puzzleNumber} />
    </div>
  )
}
