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

/**
 * How long a cascade of `count` groups takes to fully settle, from the moment
 * they are added until the last group's pulse ends.
 */
export function revealDurationMs(count: number): number {
  if (count <= 0) return 0
  return REVEAL_START_DELAY_MS + (count - 1) * REVEAL_STAGGER_MS + REVEAL_FLIP_MS + REVEAL_PULSE_MS
}
