import GameBoard from '@/components/Game/GameBoard'
import { getTodaysPuzzle } from '@/lib/puzzleApi'
import Link from 'next/link'
import Image from 'next/image'

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
          <p className="text-gray-600">In the meantime, check out some from the past!</p>
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
    <div>
      <div className="text-center mb-4 pb-4 border-b border-gray-200">
        <span className="text-lg sm:text-2xl text-gray-600">
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'America/Los_Angeles',
          })}
        </span>
      </div>
      <GameBoard puzzle={puzzle} />
    </div>
  )
}
