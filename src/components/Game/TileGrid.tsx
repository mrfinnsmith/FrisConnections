'use client'

import React, { useMemo, memo, useEffect, useRef, useCallback } from 'react'
import { GameState, SolvedGroup } from '@/types/game'
import { getAvailableTiles } from '@/lib/gameLogic'
import { trackGamePerformance } from '@/lib/performance'

interface TileGridProps {
  gameState: GameState
  onTileClick: (tile: string) => void
  animatingTiles: string[]
  animationType: 'shake' | 'bounce' | null
  onKeyboardInteraction?: (message: string) => void
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
  animationType,
  onKeyboardInteraction
}: TileGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = React.useState<number>(0)
  // Memoize expensive calculations
  const availableTiles = useMemo(() => getAvailableTiles(gameState), [gameState])
  
  // Memoize filtered display items
  const displayItems = useMemo(() => 
    gameState.shuffledItems.filter((item: string) =>
      !gameState.solvedGroups.some(group => group.category.items.includes(item))
    ), [gameState.shuffledItems, gameState.solvedGroups]
  )
  
  // Keyboard navigation handlers
  const handleKeyDown = useCallback((event: React.KeyboardEvent, tileIndex: number, tile: string) => {
    const currentRow = Math.floor(tileIndex / 4)
    const currentCol = tileIndex % 4
    const maxRow = Math.floor((displayItems.length - 1) / 4)
    const maxCol = 3
    
    let newIndex = tileIndex
    let shouldPreventDefault = true
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault() // Prevent page scrolling
        if (currentCol > 0) {
          newIndex = currentRow * 4 + (currentCol - 1)
        } else if (currentRow > 0) {
          // Wrap to end of previous row
          newIndex = (currentRow - 1) * 4 + maxCol
        }
        break
      case 'ArrowRight':
        event.preventDefault() // Prevent page scrolling
        if (currentCol < maxCol && tileIndex + 1 < displayItems.length) {
          newIndex = currentRow * 4 + (currentCol + 1)
        } else if (currentRow < maxRow) {
          // Wrap to start of next row
          newIndex = (currentRow + 1) * 4
        }
        break
      case 'ArrowUp':
        event.preventDefault() // Prevent page scrolling
        if (currentRow > 0) {
          newIndex = (currentRow - 1) * 4 + currentCol
        }
        break
      case 'ArrowDown':
        event.preventDefault() // Prevent page scrolling
        if (currentRow < maxRow) {
          const nextRowIndex = (currentRow + 1) * 4 + currentCol
          if (nextRowIndex < displayItems.length) {
            newIndex = nextRowIndex
          }
        }
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onTileClick(tile)
        onKeyboardInteraction?.(`${gameState.selectedTiles.includes(tile) ? 'Deselected' : 'Selected'} ${tile}`)
        return
      case 'Home':
        newIndex = 0
        break
      case 'End':
        newIndex = displayItems.length - 1
        break
      default:
        shouldPreventDefault = false
    }
    
    if (shouldPreventDefault) {
      event.preventDefault()
    }
    
    if (newIndex !== tileIndex && newIndex >= 0 && newIndex < displayItems.length) {
      setFocusedIndex(newIndex)
      // Focus the new tile
      const nextTile = gridRef.current?.children[newIndex] as HTMLButtonElement
      nextTile?.focus()
      onKeyboardInteraction?.(`Moved to ${displayItems[newIndex]}`)
    }
  }, [displayItems, gameState.selectedTiles, onTileClick, onKeyboardInteraction])
  
  // Reset focus when game state changes significantly and auto-focus first tile
  useEffect(() => {
    if (focusedIndex >= displayItems.length) {
      setFocusedIndex(Math.max(0, displayItems.length - 1))
    }
  }, [displayItems.length, focusedIndex])
  
  // Auto-focus the first available tile when the grid is ready
  useEffect(() => {
    if (displayItems.length > 0 && gridRef.current) {
      const firstTile = gridRef.current.children[0] as HTMLButtonElement
      if (firstTile && !firstTile.disabled) {
        // Small delay to ensure rendering is complete
        const timeoutId = setTimeout(() => {
          setFocusedIndex(0)
        }, 100)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [displayItems.length])
  
  // Memoize tile data to avoid recalculation on every render
  const tileData = useMemo(() => {
    const endTracking = trackGamePerformance.tileRender(displayItems.length);
    
    const data = displayItems.map((tile, index) => {
      const solvedGroup = getSolvedGroupForTile(tile, gameState.solvedGroups)
      const isAvailable = availableTiles.includes(tile)
      const isDisabled = gameState.gameStatus !== 'playing' || !isAvailable
      const animationIndex = animatingTiles.indexOf(tile)
      const tileClasses = getTileClasses(tile, gameState, solvedGroup, animatingTiles, animationType, animationIndex)
      const isSelected = gameState.selectedTiles.includes(tile)
      
      return {
        tile,
        index,
        tileClasses,
        isDisabled,
        isSelected
      }
    });
    
    endTracking();
    return data;
  }, [displayItems, gameState, availableTiles, animatingTiles, animationType])
  
  return (
    <div 
      ref={gridRef}
      className="grid grid-cols-4 gap-2 mb-6"
      role="grid"
      aria-label="Game tiles - use arrow keys to navigate, Enter or Space to select"
      tabIndex={0}
      onKeyDown={(event) => {
        // Handle grid-level keyboard events when no specific tile is focused
        if (event.target === gridRef.current) {
          handleKeyDown(event, focusedIndex, displayItems[focusedIndex] || '')
        }
      }}
    >
      {tileData.map(({ tile, index, tileClasses, isDisabled, isSelected }) => {
        const currentRow = Math.floor(index / 4) + 1
        const currentCol = (index % 4) + 1
        const totalTiles = displayItems.length
        
        return (
          <button
            key={`${tile}-${index}`}
            className={tileClasses}
            onClick={() => onTileClick(tile)}
            onKeyDown={(event) => handleKeyDown(event, index, tile)}
            disabled={isDisabled}
            role="gridcell"
            aria-label={`${tile}${isSelected ? ', selected' : ''}${isDisabled ? ', unavailable' : ', available'}. Row ${currentRow}, Column ${currentCol} of ${totalTiles} tiles`}
            aria-pressed={isSelected}
            aria-describedby="grid-instructions"
            tabIndex={index === focusedIndex ? 0 : -1}
          >
            {tile}
          </button>
        )
      })}
      <div id="grid-instructions" className="sr-only">
        Use arrow keys to navigate between tiles. Press Enter or Space to select or deselect a tile. Press Home to go to first tile, End to go to last tile.
      </div>
    </div>
  )
}

// Export memoized component to prevent unnecessary re-renders
export default memo(TileGrid)