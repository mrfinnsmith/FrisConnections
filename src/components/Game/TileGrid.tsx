'use client'

import React, { useMemo, memo, useEffect } from 'react'
import { GameState, SolvedGroup } from '@/types/game'
import { getAvailableTiles } from '@/lib/gameLogic'
import { trackGamePerformance } from '@/lib/performance'

interface TileGridProps {
  gameState: GameState
  onTileClick: (tile: string) => void
  animatingTiles: string[]
  animationType: 'shake' | 'bounce' | null
}

function getTileClasses(
  tile: string, 
  gameState: GameState, 
  solvedGroup: SolvedGroup | undefined,
  animatingTiles: string[],
  animationType: 'shake' | 'bounce' | null,
  animationIndex: number
): string {
  const baseClasses = 'game-tile'
  
  if (solvedGroup) {
    return `${baseClasses} solved difficulty-${solvedGroup.category.difficulty}`
  }
  
  let classes = baseClasses
  
  if (gameState.selectedTiles.includes(tile)) {
    classes += ' selected'
  }
  
  // Add animation classes
  if (animatingTiles.includes(tile) && animationType) {
    classes += ` ${animationType}`
    
    // Add staggered delay for bounce animation
    if (animationType === 'bounce' && animationIndex > 0) {
      classes += ` bounce-delay-${animationIndex}`
    }
  }
  
  return classes
}

function getSolvedGroupForTile(tile: string, solvedGroups: SolvedGroup[]): SolvedGroup | undefined {
  return solvedGroups.find(group => group.category.items.includes(tile))
}

function TileGrid({ 
  gameState, 
  onTileClick, 
  animatingTiles, 
  animationType 
}: TileGridProps) {
  // Memoize expensive calculations
  const availableTiles = useMemo(() => getAvailableTiles(gameState), [gameState])
  
  // Memoize filtered display items
  const displayItems = useMemo(() => 
    gameState.shuffledItems.filter((item: string) =>
      !gameState.solvedGroups.some(group => group.category.items.includes(item))
    ), [gameState.shuffledItems, gameState.solvedGroups]
  )
  
  // Memoize tile data to avoid recalculation on every render
  const tileData = useMemo(() => {
    const endTracking = trackGamePerformance.tileRender(displayItems.length);
    
    const data = displayItems.map((tile, index) => {
      const solvedGroup = getSolvedGroupForTile(tile, gameState.solvedGroups)
      const isAvailable = availableTiles.includes(tile)
      const isDisabled = gameState.gameStatus !== 'playing' || !isAvailable
      const animationIndex = animatingTiles.indexOf(tile)
      const tileClasses = getTileClasses(tile, gameState, solvedGroup, animatingTiles, animationType, animationIndex)
      
      return {
        tile,
        index,
        tileClasses,
        isDisabled
      }
    });
    
    endTracking();
    return data;
  }, [displayItems, gameState, availableTiles, animatingTiles, animationType])
  
  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      {tileData.map(({ tile, index, tileClasses, isDisabled }) => (
        <button
          key={`${tile}-${index}`}
          className={tileClasses}
          onClick={() => onTileClick(tile)}
          disabled={isDisabled}
        >
          {tile}
        </button>
      ))}
    </div>
  )
}

// Export memoized component to prevent unnecessary re-renders
export default memo(TileGrid)