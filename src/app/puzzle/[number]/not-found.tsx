import Link from 'next/link'

export default function PuzzleNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Puzzle not found</h1>
        <p className="mb-6">This puzzle doesn't exist or hasn't been published yet.</p>
        <Link
          href="/archive"
          className="px-4 py-2 bg-sf-navy text-white rounded-lg hover:bg-sf-navy-dark transition-colors"
        >
          Back to Past Puzzles
        </Link>
      </div>
    </div>
  )
}
