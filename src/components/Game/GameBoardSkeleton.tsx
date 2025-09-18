'use client'

import {
  TileGridSkeleton,
  GameControlsSkeleton,
  GameInfoSkeleton,
  SkeletonWrapper,
} from '@/components/UI/Skeleton'

interface GameBoardSkeletonProps {
  isPastPuzzle?: boolean
  showSolvedGroups?: boolean
}

export default function GameBoardSkeleton({
  isPastPuzzle = false,
  showSolvedGroups = false,
}: GameBoardSkeletonProps) {
  return (
    <div className="max-w-md mx-auto p-4">
      {/* Game info skeleton */}
      <GameInfoSkeleton />

      {/* Solved groups skeleton (if any groups are solved) */}
      {showSolvedGroups && (
        <div className="mb-6 space-y-2">
          {Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => (
            <div key={i} className="p-4 rounded-lg bg-gray-100 animate-pulse">
              <div className="text-center space-y-2">
                <div className="h-6 bg-gray-200 rounded w-32 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tile grid skeleton */}
      <TileGridSkeleton />

      {/* Game controls skeleton */}
      <GameControlsSkeleton />
    </div>
  )
}

// Loading wrapper for GameBoard
interface GameBoardLoadingWrapperProps {
  loading: boolean
  isPastPuzzle?: boolean
  children: React.ReactNode
}

export function GameBoardLoadingWrapper({
  loading,
  isPastPuzzle,
  children,
}: GameBoardLoadingWrapperProps) {
  return (
    <SkeletonWrapper loading={loading} skeleton={<GameBoardSkeleton isPastPuzzle={isPastPuzzle} />}>
      {children}
    </SkeletonWrapper>
  )
}
