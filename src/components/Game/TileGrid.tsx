'use client'

import React, { useMemo, memo, useEffect, useRef, useCallback } from 'react'
import { GameState, SolvedGroup } from '@/types/game'
import { getAvailableTiles } from '@/lib/gameLogic'
import { trackGamePerformance } from '@/lib/performance'

interface TileGridProps {
  gameState: GameState
  onTileClick: (tile: string) => void
  animatingTiles: string[]
  animationType: 'shake' | 'bounce' | 'shuffle' | 'shrink' | null
  onKeyboardInteraction?: (message: string) => void
}

function getTileClasses(
  tile: string,
  gameState: GameState,
  solvedGroup: SolvedGroup | undefined,
  animatingTiles: string[],
  animationType: 'shake' | 'bounce' | 'shuffle' | 'shrink' | null,
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
  onKeyboardInteraction,
}: TileGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = React.useState<number>(0)
  const [fontSizes, setFontSizes] = React.useState<Record<string, number>>({})
  // Memoize expensive calculations
  const availableTiles = useMemo(() => getAvailableTiles(gameState), [gameState])

  // Memoize filtered display items
  const displayItems = useMemo(
    () =>
      gameState.shuffledItems.filter(
        (item: string) => !gameState.solvedGroups.some(group => group.category.items.includes(item))
      ),
    [gameState.shuffledItems, gameState.solvedGroups]
  )

  // Keyboard navigation handlers
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, tileIndex: number, tile: string) => {
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
          onKeyboardInteraction?.(
            `${gameState.selectedTiles.includes(tile) ? 'Deselected' : 'Selected'} ${tile}`
          )
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
    },
    [displayItems, gameState.selectedTiles, onTileClick, onKeyboardInteraction]
  )

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

  // Measure and adjust font sizes to prevent overflow
  const measureFontSizes = useCallback(() => {
    if (!gridRef.current) return

    const newFontSizes: Record<string, number> = {}
    const buttons = Array.from(gridRef.current.children).filter(
      child => child.tagName === 'BUTTON'
    ) as HTMLButtonElement[]

    const range = document.createRange()

    // Width of the widest rendered line, measured via a Range. Unlike
    // scrollWidth, this reports the true text bounding box even when the text
    // is centered and overflows both edges of the tile. Returns 0 in
    // environments without getClientRects (e.g. jsdom) so measurement no-ops.
    const widestLine = (span: HTMLElement): number => {
      if (typeof range.getClientRects !== 'function') return 0
      range.selectNodeContents(span)
      const rects = range.getClientRects()
      let max = 0
      for (let i = 0; i < rects.length; i++) {
        if (rects[i].width > max) max = rects[i].width
      }
      return max
    }

    buttons.forEach(button => {
      const textSpan = button.querySelector('.tile-text') as HTMLElement
      if (!textSpan) return

      const tile = displayItems[buttons.indexOf(button)]
      if (!tile) return

      // Reset to base size
      textSpan.style.fontSize = ''

      const computedStyle = window.getComputedStyle(button)
      const baseFontSize = parseFloat(computedStyle.fontSize)
      let fontSize = baseFontSize
      const minFontSize = 8 // 8px minimum

      // Available space is the BUTTON's content box, not the span. The span is
      // width:100% inside a grid cell whose implicit column grows to max-content,
      // so a too-wide word makes the span itself widen and overflow the tile;
      // the button stays fixed and is the true boundary to fit within.
      const paddingX =
        parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight)
      const paddingY =
        parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom)
      const availableWidth = button.clientWidth - paddingX
      const availableHeight = button.clientHeight - paddingY

      // Skip if the tile has not been laid out yet (avoids measuring against a
      // zero-width box before the grid sizes itself)
      if (availableWidth <= 0 || availableHeight <= 0) return

      // Shrink only while the text actually overflows
      let iterations = 0
      while (
        (widestLine(textSpan) > availableWidth + 0.5 ||
          textSpan.scrollHeight > availableHeight + 0.5) &&
        fontSize > minFontSize &&
        iterations < 30
      ) {
        fontSize *= 0.9 // Reduce by 10%
        textSpan.style.fontSize = `${fontSize}px`
        iterations++
      }

      if (fontSize !== baseFontSize) {
        newFontSizes[tile] = fontSize
      }
    })

    setFontSizes(newFontSizes)
  }, [displayItems])

  useEffect(() => {
    measureFontSizes()

    // Re-measure once the web font finishes loading. The bold display font is
    // wider than the fallback, so measuring too early under-shrinks the text.
    let cancelled = false
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) measureFontSizes()
      })
    }

    // Re-measure when the grid is resized (rotation, window resize, layout shifts)
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measureFontSizes()) : null
    if (observer && gridRef.current) observer.observe(gridRef.current)

    return () => {
      cancelled = true
      observer?.disconnect()
    }
  }, [measureFontSizes, gameState.solvedGroups])

  // Helper function to determine text length category
  const getTextLengthCategory = (text: string): 'normal' | 'long' | 'very-long' => {
    const length = text.length
    if (length <= 12) return 'normal'
    if (length <= 18) return 'long'
    return 'very-long'
  }

  // Memoize tile data to avoid recalculation on every render
  const tileData = useMemo(() => {
    const endTracking = trackGamePerformance.tileRender(displayItems.length)

    const data = displayItems.map((tile, index) => {
      const solvedGroup = getSolvedGroupForTile(tile, gameState.solvedGroups)
      const isAvailable = availableTiles.includes(tile)
      const isDisabled = gameState.gameStatus !== 'playing' || !isAvailable
      const animationIndex = animatingTiles.indexOf(tile)
      const tileClasses = getTileClasses(
        tile,
        gameState,
        solvedGroup,
        animatingTiles,
        animationType,
        animationIndex
      )
      const isSelected = gameState.selectedTiles.includes(tile)
      const textLength = getTextLengthCategory(tile)

      return {
        tile,
        index,
        tileClasses,
        isDisabled,
        isSelected,
        textLength,
      }
    })

    endTracking()
    return data
  }, [displayItems, gameState, availableTiles, animatingTiles, animationType])

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-4 gap-2 mb-8 mx-auto w-[calc(3_*_0.5rem_+_4_*_22.5vw)] sm:w-[calc(3_*_0.5rem_+_4_*_150px)]"
      role="grid"
      aria-label="Game tiles - use arrow keys to navigate, Enter or Space to select"
      tabIndex={0}
      onKeyDown={event => {
        // Handle grid-level keyboard events when no specific tile is focused
        if (event.target === gridRef.current) {
          handleKeyDown(event, focusedIndex, displayItems[focusedIndex] || '')
        }
      }}
    >
      {tileData.map(({ tile, index, tileClasses, isDisabled, isSelected, textLength }) => {
        const currentRow = Math.floor(index / 4) + 1
        const currentCol = (index % 4) + 1
        const totalTiles = displayItems.length

        return (
          <button
            key={`${tile}-${index}`}
            className={tileClasses}
            data-text-length={textLength}
            onClick={() => onTileClick(tile)}
            onKeyDown={event => handleKeyDown(event, index, tile)}
            disabled={isDisabled}
            role="gridcell"
            aria-label={`${tile}${isSelected ? ', selected' : ''}${isDisabled ? ', unavailable' : ', available'}. Row ${currentRow}, Column ${currentCol} of ${totalTiles} tiles`}
            aria-pressed={isSelected}
            aria-describedby="grid-instructions"
            tabIndex={index === focusedIndex ? 0 : -1}
          >
            <span
              className="tile-text"
              style={fontSizes[tile] ? { fontSize: `${fontSizes[tile]}px` } : undefined}
            >
              {tile}
            </span>
          </button>
        )
      })}
      <div id="grid-instructions" className="sr-only">
        Use arrow keys to navigate between tiles. Press Enter or Space to select or deselect a tile.
        Press Home to go to first tile, End to go to last tile.
      </div>
    </div>
  )
}

// Export memoized component to prevent unnecessary re-renders
export default memo(TileGrid)
