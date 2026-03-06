import { Skeleton } from '@/components/UI/Skeleton'
import GameBoardSkeleton from '@/components/Game/GameBoardSkeleton'

export default function PuzzleLoading() {
  return (
    <div className="space-y-4">
      <div className="w-full max-w-lg mx-auto mb-6">
        <div className="text-center mb-4 space-y-2">
          <Skeleton height="h-8" width="w-32" className="mx-auto" />
          <Skeleton height="h-4" width="w-24" className="mx-auto" />
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <Skeleton height="h-10" width="w-28" rounded="lg" />
          <Skeleton height="h-10" width="w-32" rounded="lg" />
        </div>
      </div>

      <GameBoardSkeleton isPastPuzzle={true} />
    </div>
  )
}
