import GameBoard from '@/components/Game/GameBoard'
import { getTodaysPuzzle } from '@/lib/puzzleApi'

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
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Find groups of four items that share something in common.
        </p>
        <p className="text-sm text-gray-500">
          Create four groups to solve the puzzle!
        </p>
      </div>
      
      <GameBoard puzzle={puzzle} />
      
      <div className="text-center text-xs text-gray-400 mt-8">
        <p>© 2024 Frisconnections - A San Francisco word puzzle game</p>
      </div>
    </div>
  )
}