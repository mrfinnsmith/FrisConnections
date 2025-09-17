import GameBoard from '@/components/Game/GameBoard'
import { getTodaysPuzzle } from '@/lib/puzzleApi'
import Link from 'next/link'
import Image from 'next/image'
import ErrorTestComponent from '@/components/ErrorTestComponent'

export const revalidate = 3600

export default async function Home() {
  const puzzle = await getTodaysPuzzle()

  if (!puzzle) {
    return (
      <div className="text-center space-y-6">
        <div className="relative w-full max-w-sm mx-auto">
          <Image
            src="/gg-bridge-ship.jpg"
            alt="Golden Gate Bridge with container ship"
            width={400}
            height={300}
            className="rounded-lg shadow-md w-full h-auto"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Today's FrisConnections is still on the ship
          </h2>
          <p className="text-gray-600">
            In the meantime, check out some from the past!
          </p>
          <Link
            href="/past"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Past Puzzles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {process.env.NODE_ENV === 'development' && (
        <ErrorTestComponent />
      )}
      
      <div className="text-center">
        <p className="text-gray-700 mb-4">
          Create four groups of four!
        </p>
      </div>
      <div className="text-center mb-4">
        <p className="text-gray-600 text-sm">
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'America/Los_Angeles'
          })}
        </p>
      </div>

      <GameBoard puzzle={puzzle} />
    </div>
  )
}