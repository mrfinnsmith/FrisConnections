import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import DifficultyBadge from '@/components/DifficultyBadge'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PastPuzzlesErrorFallback } from '@/components/ErrorFallbacks'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

interface PastPuzzle {
  puzzle_number: number
  last_presented: string | null
  difficulty_tier?: number
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'Never presented'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function getPastPuzzles(): Promise<PastPuzzle[]> {
  const { data, error } = await supabase.rpc('frisc_get_past_puzzles')

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export default async function PastPuzzlesPage() {
  const puzzles = await getPastPuzzles()

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
          {puzzles.map(puzzle => (
            <div
              key={puzzle.puzzle_number}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div>
                <h3 className="font-semibold">Puzzle #{puzzle.puzzle_number}</h3>
                <p className="text-sm text-gray-600">
                  Last presented: {formatDate(puzzle.last_presented)}
                </p>
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
