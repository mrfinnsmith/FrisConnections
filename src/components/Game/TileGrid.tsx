'use client'

import { GameState, SolvedGroup } from '@/types/game'
import { getAvailableTiles } from '@/lib/gameLogic'

interface TileGridProps {
  gameState: GameState
  tiles: string[]
  onTileClick: (tile: string) => void
}

function getTileClasses(
  tile: string, 
  gameState: GameState, 
  solvedGroup?: SolvedGroup
): string {
  const baseClasses = 'game-tile'
  
  if (solvedGroup) {
    return `${baseClasses} solved difficulty-${solvedGroup.category.difficulty}`
  }
  
  if (gameState.selectedTiles.includes(tile)) {
    return `${baseClasses} selected`
  }
  
  return baseClasses
}

function getSolvedGroupForTile(tile: string, solvedGroups: SolvedGroup[]): SolvedGroup | undefined {
  return solvedGroups.find(group => group.category.items.includes(tile))
}

export default function TileGrid({ gameState, tiles, onTileClick }: TileGridProps) {
  const availableTiles = getAvailableTiles(gameState)
  
  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      {tiles.map((tile, index) => {
        const solvedGroup = getSolvedGroupForTile(tile, gameState.solvedGroups)
        const isAvailable = availableTiles.includes(tile)
        const isDisabled = gameState.gameStatus !== 'playing' || !isAvailable
        
        return (
          <button
            key={`${tile}-${index}`}
            className={getTileClasses(tile, gameState, solvedGroup)}
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