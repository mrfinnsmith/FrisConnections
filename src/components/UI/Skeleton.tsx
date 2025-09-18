'use client'

import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  animate?: boolean
}

export function Skeleton({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'md',
  animate = true,
}: SkeletonProps) {
  const roundedClass = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded]

  const animateClass = animate ? 'animate-pulse' : ''

  return (
    <div
      className={`bg-gray-200 ${width} ${height} ${roundedClass} ${animateClass} ${className}`}
      aria-label="Loading..."
    />
  )
}

// Game-specific skeleton components
export function TileSkeleton() {
  return <Skeleton className="aspect-square" height="h-12" rounded="md" />
}

export function TileGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      {Array.from({ length: 16 }, (_, i) => (
        <TileSkeleton key={i} />
      ))}
    </div>
  )
}

export function SolvedGroupSkeleton() {
  return (
    <div className="mb-2 p-4 rounded-lg bg-gray-100">
      <div className="text-center space-y-2">
        <Skeleton height="h-6" width="w-32" className="mx-auto" />
        <Skeleton height="h-4" width="w-48" className="mx-auto" />
      </div>
    </div>
  )
}

export function GameControlsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Mistakes Display Skeleton */}
      <div className="text-center">
        <Skeleton height="h-4" width="w-32" className="mx-auto mb-2" />
        <div className="flex justify-center gap-1">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} width="w-3" height="h-3" rounded="full" />
          ))}
        </div>
      </div>

      {/* Control Buttons Skeleton */}
      <div className="flex justify-center gap-2">
        <Skeleton height="h-10" width="w-20" rounded="md" />
        <Skeleton height="h-10" width="w-24" rounded="md" />
        <Skeleton height="h-10" width="w-16" rounded="md" />
      </div>
    </div>
  )
}

export function PuzzleCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
      <div className="space-y-2">
        <Skeleton height="h-5" width="w-24" />
        <Skeleton height="h-4" width="w-40" />
        <Skeleton height="h-6" width="w-16" rounded="full" />
      </div>
      <Skeleton height="h-10" width="w-16" rounded="md" />
    </div>
  )
}

export function GameInfoSkeleton() {
  return (
    <div className="mb-6">
      <div className="text-center mb-4 space-y-2">
        <Skeleton height="h-4" width="w-24" className="mx-auto" />
        <Skeleton height="h-4" width="w-32" className="mx-auto" />
      </div>
      <div className="text-center mb-4">
        <Skeleton height="h-4" width="w-28" className="mx-auto" />
      </div>
    </div>
  )
}

// Skeleton wrapper for loading states
interface SkeletonWrapperProps {
  loading: boolean
  skeleton: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SkeletonWrapper({
  loading,
  skeleton,
  children,
  className = '',
}: SkeletonWrapperProps) {
  return <div className={className}>{loading ? skeleton : children}</div>
}

// Staggered loading for lists
interface SkeletonListProps {
  count: number
  renderSkeleton: (index: number) => React.ReactNode
  staggerDelay?: number
  className?: string
}

export function SkeletonList({
  count,
  renderSkeleton,
  staggerDelay = 100,
  className = '',
}: SkeletonListProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            animationDelay: `${i * staggerDelay}ms`,
            animationDuration: '1.5s',
          }}
          className="animate-pulse"
        >
          {renderSkeleton(i)}
        </div>
      ))}
    </div>
  )
}
