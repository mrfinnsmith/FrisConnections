'use client'

import React, { useMemo, memo } from 'react'
import { SolvedGroup } from '@/types/game'

interface SolvedGroupsProps {
  solvedGroups: SolvedGroup[]
}

function SolvedGroups({ solvedGroups }: SolvedGroupsProps) {
  // Helper function to determine text length category
  const getTextLengthCategory = (text: string): 'normal' | 'long' | 'very-long' => {
    const length = text.length
    if (length <= 12) return 'normal'
    if (length <= 20) return 'long'
    return 'very-long'
  }

  // Memoize sorted groups to prevent unnecessary sorting on every render
  const sortedGroups = useMemo(() => {
    if (solvedGroups.length === 0) return []
    return [...solvedGroups].sort((a, b) => a.category.difficulty - b.category.difficulty)
  }, [solvedGroups])

  // Memoize group elements to prevent recreation when parent re-renders
  const groupElements = useMemo(
    () =>
      sortedGroups.map(group => {
        const itemsText = group.category.items.join(', ')
        const titleLength = getTextLengthCategory(group.category.name)

        return (
          <div
            key={group.category.id}
            className={`solved-group difficulty-${group.category.difficulty}`}
            data-text-length={titleLength}
          >
            <div className="text-center">
              <h3 className="font-bold text-lg mb-1">{group.category.name}</h3>
              <p className="text-sm opacity-90">{itemsText}</p>
            </div>
          </div>
        )
      }),
    [sortedGroups]
  )

  if (solvedGroups.length === 0) return null

  return <div className="mb-6 space-y-2">{groupElements}</div>
}

// Export memoized component
export default memo(SolvedGroups)
