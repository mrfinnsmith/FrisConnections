import Link from 'next/link'
import { PuzzleCardSkeleton } from '@/components/UI/Skeleton'

export default function ArchiveLoading() {
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

      <div className="space-y-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
            <PuzzleCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  )
}
