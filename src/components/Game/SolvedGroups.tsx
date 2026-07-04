'use client'

import React, { useMemo, memo, useRef, useState, useEffect } from 'react'
import { SolvedGroup } from '@/types/game'
import {
  REVEAL_START_DELAY_MS,
  REVEAL_STAGGER_MS,
  REVEAL_FLIP_MS,
  REVEAL_PULSE_MS,
} from '@/lib/reveal'

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

  // Groups already solved on first render (e.g. page reload, replaying a past
  // puzzle) start flipped with no animation. Only groups that appear afterward
  // get the 3D flip + pulse reveal.
  const initialIds = useRef<Set<string | number>>(
    new Set(solvedGroups.map(group => group.category.id))
  )
  const processedIds = useRef<Set<string | number>>(new Set(initialIds.current))
  const [flipIds, setFlipIds] = useState<Set<string | number>>(() => new Set(initialIds.current))
  const [pulseIds, setPulseIds] = useState<Set<string | number>>(() => new Set())

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Groups added since the last render reveal in a cascade: each starts its
    // flip REVEAL_STAGGER_MS after the previous new one. A lone solved group
    // (stagger index 0) reveals immediately; a lost game appends several at once
    // and they flip in sequence by difficulty.
    let revealIndex = 0

    sortedGroups.forEach(group => {
      const id = group.category.id
      if (processedIds.current.has(id)) return
      processedIds.current.add(id)

      const startDelay = REVEAL_START_DELAY_MS + revealIndex * REVEAL_STAGGER_MS
      revealIndex++

      // Render unflipped first, then flip so the transition actually runs.
      // Pulse fires once the flip settles.
      timers.push(
        setTimeout(() => {
          setFlipIds(prev => new Set(prev).add(id))
        }, startDelay)
      )
      timers.push(
        setTimeout(() => {
          setPulseIds(prev => new Set(prev).add(id))
        }, startDelay + REVEAL_FLIP_MS)
      )
      timers.push(
        setTimeout(
          () => {
            setPulseIds(prev => {
              const next = new Set(prev)
              next.delete(id)
              return next
            })
          },
          startDelay + REVEAL_FLIP_MS + REVEAL_PULSE_MS
        )
      )
    })

    return () => timers.forEach(clearTimeout)
  }, [sortedGroups])

  // Memoize group elements to prevent recreation when parent re-renders
  const groupElements = useMemo(
    () =>
      sortedGroups.map(group => {
        const id = group.category.id
        const itemsText = group.category.items.join(', ')
        const titleLength = getTextLengthCategory(group.category.name)
        const flip = flipIds.has(id) ? ' flip' : ''
        const pulse = pulseIds.has(id) ? ' pulse' : ''

        return (
          <div
            key={id}
            className={`solved-group difficulty-${group.category.difficulty}${flip}${pulse}`}
            data-text-length={titleLength}
          >
            <div className="solved-group-inner">
              <div className="solved-group-front" aria-hidden="true">
                <p className="text-base font-medium leading-tight">{itemsText}</p>
              </div>
              <div className="solved-group-back">
                <h3 className="font-bold text-base leading-tight mb-1">{group.category.name}</h3>
                <p className="text-base font-medium leading-tight">{itemsText}</p>
              </div>
            </div>
          </div>
        )
      }),
    [sortedGroups, flipIds, pulseIds]
  )

  if (solvedGroups.length === 0) return null

  return (
    <div className="mb-2 space-y-2 w-full sm:w-[calc(3_*_0.5rem_+_4_*_150px)] mx-auto">
      {groupElements}
    </div>
  )
}

// Export memoized component
export default memo(SolvedGroups)
