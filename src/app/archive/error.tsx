'use client'

export default function ArchiveError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="text-center text-red-600 mb-4">Error loading past puzzles</div>
      <div className="text-center">
        <button
          onClick={reset}
          className="px-4 py-2 bg-sf-navy text-white rounded-lg hover:bg-sf-navy-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
