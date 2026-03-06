'use client'

import Link from 'next/link'

export default function PuzzleError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-6">Failed to load this puzzle.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-sf-navy text-white rounded-lg hover:bg-sf-navy-dark transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/archive"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Past Puzzles
          </Link>
        </div>
      </div>
    </div>
  )
}
