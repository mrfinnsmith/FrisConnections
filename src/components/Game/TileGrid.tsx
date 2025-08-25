'use client'

import { GameState, SolvedGroup } from '@/types/game'
import { getAvailableTiles } from '@/lib/gameLogic'

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

export default function TileGrid({ 
  gameState, 
  onTileClick, 
  animatingTiles, 
  animationType 
}: TileGridProps) {
  const availableTiles = getAvailableTiles(gameState)
  
  // Get items that should be displayed (not solved)
  const displayItems = gameState.shuffledItems.filter((item: string) =>
    !gameState.solvedGroups.some(group => group.category.items.includes(item))
  );
  
  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      {displayItems.map((tile, index) => {
        const solvedGroup = getSolvedGroupForTile(tile, gameState.solvedGroups)
        const isAvailable = availableTiles.includes(tile)
        const isDisabled = gameState.gameStatus !== 'playing' || !isAvailable
        
        // Get animation index for staggered delays
        const animationIndex = animatingTiles.indexOf(tile)
        
        return (
          <button
            key={`${tile}-${index}`}
            className={getTileClasses(tile, gameState, solvedGroup, animatingTiles, animationType, animationIndex)}
            onClick={() => onTileClick(tile)}
            disabled={isDisabled}
          >
            {tile}
          </button>
        )
      })}
    </div>
  )
}