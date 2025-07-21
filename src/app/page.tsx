import GameBoard from '@/components/Game/GameBoard'
import { getTodaysPuzzle } from '@/lib/puzzleApi'

export const revalidate = 3600

export default async function Home() {
  const puzzle = await getTodaysPuzzle()

  if (!puzzle) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          No puzzle available today
        </h2>
        <p className="text-gray-600">
          Please check back later for today's puzzle!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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