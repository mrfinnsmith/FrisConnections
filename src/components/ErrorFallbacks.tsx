'use client'

// Client-side error fallback components to avoid SSR serialization issues

export function GameErrorFallback() {
  return (
    <div className="text-center py-4">
      <p className="text-red-600 mb-2">Game board error</p>
      <button
        onClick={() => window.location.reload()}
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
      >
        Restart Game
      </button>
    </div>
  )
}

export function ResultsErrorFallback({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 text-center max-w-sm">
        <p className="text-red-600 mb-4">Results display error</p>
        <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded">
          Close
        </button>
      </div>
    </div>
  )
}

export function PastPuzzlesErrorFallback() {
  return (
    <div className="text-center py-8">
      <p className="text-red-600 mb-4">Error loading puzzle list</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Reload Page
      </button>
    </div>
  )
}

export function GameMainErrorFallback() {
  return (
    <div className="text-center py-8">
      <p className="text-red-600 mb-4">Something went wrong with the game.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Reload Game
      </button>
    </div>
  )
}

export function StatsErrorFallback() {
  return (
    <div className="text-center py-8">
      <p className="text-red-600 mb-4">Error loading statistics</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Reload Page
      </button>
    </div>
  )
}
