import { Puzzle, Category, TILES_PER_GROUP } from '@/types/game'

/**
 * Single source of truth for turning a Supabase RPC response into a validated
 * `Puzzle`.
 *
 * Two RPCs return the same logical puzzle in two different shapes:
 *   - `frisc_get_daily_puzzle()` returns one flat row *per category* (the
 *     puzzle fields repeat on every row).
 *   - `frisc_get_puzzle_by_number()` returns a single pre-nested object.
 *
 * Rather than let each call site assemble a `Puzzle` its own way (which is how
 * the two paths drifted apart), every shape is normalised to `PuzzleInput` and
 * handed to `buildPuzzle`, so category mapping, validation, and optional-field
 * handling all live in exactly one place.
 */

const CATEGORIES_PER_PUZZLE = 4

/** Raw row from `frisc_get_daily_puzzle()` — one per category. */
export interface DailyPuzzleRow {
  puzzle_id: number
  puzzle_number: number
  category_id: number
  category_name: string
  difficulty: 1 | 2 | 3 | 4
  items: string[]
  /** Presentation date, if the RPC provides it. Absent today; read when present. */
  date?: string | null
}

/** Raw object from `frisc_get_puzzle_by_number()` — already nested. */
export interface PuzzleByNumberResult {
  id: number
  puzzle_number: number
  difficulty_tier?: 1 | 2 | 3 | null
  date?: string | null
  categories: RawCategory[]
}

interface RawCategory {
  id: number
  name: string
  difficulty: 1 | 2 | 3 | 4
  items: string[]
}

/** Canonical, shape-agnostic input that `buildPuzzle` validates and assembles. */
interface PuzzleInput {
  id: number
  puzzle_number: number
  date?: string | null
  difficulty_tier?: 1 | 2 | 3 | null
  categories: RawCategory[]
}

/** Thrown when an RPC response does not satisfy the `Puzzle` invariants. */
export class InvalidPuzzleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidPuzzleError'
  }
}

function toCategory(raw: RawCategory): Category {
  const isValid =
    raw != null &&
    typeof raw.id === 'number' &&
    typeof raw.name === 'string' &&
    raw.name.length > 0 &&
    Array.isArray(raw.items) &&
    raw.items.length === TILES_PER_GROUP

  if (!isValid) {
    throw new InvalidPuzzleError(
      `Category ${raw?.id ?? '<unknown>'} is malformed (expected a name and ${TILES_PER_GROUP} items)`
    )
  }

  return {
    id: raw.id,
    name: raw.name,
    difficulty: raw.difficulty,
    items: raw.items,
  }
}

function buildPuzzle(input: PuzzleInput): Puzzle {
  if (input == null || typeof input.id !== 'number' || typeof input.puzzle_number !== 'number') {
    throw new InvalidPuzzleError('Puzzle is missing an id or puzzle_number')
  }

  if (!Array.isArray(input.categories) || input.categories.length !== CATEGORIES_PER_PUZZLE) {
    throw new InvalidPuzzleError(
      `Expected ${CATEGORIES_PER_PUZZLE} categories, received ${input.categories?.length ?? 0}`
    )
  }

  const puzzle: Puzzle = {
    id: input.id,
    puzzle_number: input.puzzle_number,
    categories: input.categories.map(toCategory),
  }

  // Optional fields are populated only when the source actually provides them —
  // never fabricated. `date` is presentation metadata the DB owns; it stays
  // absent until an RPC returns it.
  if (input.date) {
    puzzle.date = input.date
  }
  if (input.difficulty_tier != null) {
    puzzle.difficulty_tier = input.difficulty_tier
  }

  return puzzle
}

/** Normalise the flat rows from `frisc_get_daily_puzzle()` into a `Puzzle`. */
export function mapDailyPuzzle(rows: DailyPuzzleRow[]): Puzzle {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new InvalidPuzzleError('Daily puzzle response was empty')
  }

  const [head] = rows
  return buildPuzzle({
    id: head.puzzle_id,
    puzzle_number: head.puzzle_number,
    date: head.date ?? null,
    categories: rows.map(row => ({
      id: row.category_id,
      name: row.category_name,
      difficulty: row.difficulty,
      items: row.items,
    })),
  })
}

/** Normalise the nested object from `frisc_get_puzzle_by_number()` into a `Puzzle`. */
export function mapPuzzleByNumber(raw: PuzzleByNumberResult): Puzzle {
  if (raw == null) {
    throw new InvalidPuzzleError('Puzzle response was empty')
  }

  return buildPuzzle({
    id: raw.id,
    puzzle_number: raw.puzzle_number,
    date: raw.date ?? null,
    difficulty_tier: raw.difficulty_tier ?? null,
    categories: raw.categories,
  })
}
