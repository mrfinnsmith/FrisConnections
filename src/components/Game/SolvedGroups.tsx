'use client'

import { SolvedGroup } from '@/types/game'

interface SolvedGroupsProps {
  solvedGroups: SolvedGroup[]
}

export default function SolvedGroups({ solvedGroups }: SolvedGroupsProps) {
  if (solvedGroups.length === 0) return null
  
  // Sort by difficulty for consistent display
  const sortedGroups = [...solvedGroups].sort((a, b) => a.category.difficulty - b.category.difficulty)
  
  return (
    <div className="mb-6 space-y-2">
      {sortedGroups.map((group) => (
        <div 
          key={group.category.id}
          className={`solved-group difficulty-${group.category.difficulty}`}
        >
          <div className="text-center">
            <h3 className="font-bold text-lg mb-1">
              {group.category.name}
            </h3>
            <p className="text-sm opacity-90">
              {group.category.items.join(', ')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}