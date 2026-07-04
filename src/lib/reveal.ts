// Timing (in ms) for the solved-group reveal animation.
//
// Kept in one place because two components depend on it: SolvedGroups runs the
// flip/pulse animation, and GameBoard waits for a losing reveal to finish before
// opening the results modal. Change the feel here and both stay in sync.

// Small pause before a group starts flipping, so the bar renders face-down first
// and the 0.6s transition actually plays.
export const REVEAL_START_DELAY_MS = 30

// Gap between consecutive groups when several reveal at once (the loss cascade).
// A single solved group reveals immediately (stagger index 0).
export const REVEAL_STAGGER_MS = 250

// Duration of the 3D flip.
export const REVEAL_FLIP_MS = 600

// Duration of the pulse that fires once the flip settles.
export const REVEAL_PULSE_MS = 320

// Duration of the tile-collapse animation that plays on a group's four tiles
// just before its colored bar flips in during a losing reveal. Matches the
// `tile-collapse` keyframe in globals.css.
export const REVEAL_COLLAPSE_MS = 300

/**
 * How long a cascade of `count` groups takes to fully settle, from the moment
 * they are added until the last group's pulse ends.
 */
export function revealDurationMs(count: number): number {
  if (count <= 0) return 0
  return REVEAL_START_DELAY_MS + (count - 1) * REVEAL_STAGGER_MS + REVEAL_FLIP_MS + REVEAL_PULSE_MS
}

/**
 * How long a single group takes to reveal during a losing cascade: its four
 * tiles collapse, then its bar flips and pulses in (revealDurationMs(1), since
 * only one group is added to the board at a time).
 */
export function groupRevealDurationMs(): number {
  return REVEAL_COLLAPSE_MS + revealDurationMs(1)
}

/**
 * Total time for the losing reveal, where `unsolvedCount` groups are revealed
 * one at a time in sequence. GameBoard opens the results modal only once this
 * has elapsed; tests derive their waits from the same helper.
 */
export function losingRevealDurationMs(unsolvedCount: number): number {
  if (unsolvedCount <= 0) return 0
  return unsolvedCount * groupRevealDurationMs()
}
