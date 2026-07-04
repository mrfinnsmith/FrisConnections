import { describe, it, expect } from 'vitest'
import {
  mapDailyPuzzle,
  mapPuzzleByNumber,
  InvalidPuzzleError,
  DailyPuzzleRow,
  PuzzleByNumberResult,
} from '../puzzleMapper'

// The same logical puzzle expressed in each RPC's shape, so the two mappers can
// be asserted to converge on an identical `Puzzle`.
const dailyRows: DailyPuzzleRow[] = [
  {
    puzzle_id: 4,
    puzzle_number: 1,
    category_id: 47,
    category_name: 'COFFEE SHOPS',
    difficulty: 1,
    items: ['ANDYTOWN', 'RITUAL', 'RÉVEILLE', 'SIGHTGLASS'],
  },
  {
    puzzle_id: 4,
    puzzle_number: 1,
    category_id: 46,
    category_name: 'IRISH COFFEE',
    difficulty: 2,
    items: ['COFFEE', 'WHISKY', 'SUGAR', 'CREAM'],
  },
  {
    puzzle_id: 4,
    puzzle_number: 1,
    category_id: 45,
    category_name: 'MOVIES SET IN SF',
    difficulty: 3,
    items: ['MILK', 'PACIFIC HEIGHTS', 'ALWAYS BE MY MAYBE', 'ANT-MAN'],
  },
  {
    puzzle_id: 4,
    puzzle_number: 1,
    category_id: 44,
    category_name: 'FULL HOUSE OPENING CREDITS',
    difficulty: 4,
    items: ['GOLDEN GATE BRIDGE', 'CONVERTIBLE', 'SOCCER', 'PAINTED LADIES'],
  },
]

const byNumber: PuzzleByNumberResult = {
  id: 4,
  puzzle_number: 1,
  categories: [
    {
      id: 47,
      name: 'COFFEE SHOPS',
      difficulty: 1,
      items: ['ANDYTOWN', 'RITUAL', 'RÉVEILLE', 'SIGHTGLASS'],
    },
    { id: 46, name: 'IRISH COFFEE', difficulty: 2, items: ['COFFEE', 'WHISKY', 'SUGAR', 'CREAM'] },
    {
      id: 45,
      name: 'MOVIES SET IN SF',
      difficulty: 3,
      items: ['MILK', 'PACIFIC HEIGHTS', 'ALWAYS BE MY MAYBE', 'ANT-MAN'],
    },
    {
      id: 44,
      name: 'FULL HOUSE OPENING CREDITS',
      difficulty: 4,
      items: ['GOLDEN GATE BRIDGE', 'CONVERTIBLE', 'SOCCER', 'PAINTED LADIES'],
    },
  ],
}

describe('puzzleMapper', () => {
  it('maps the daily RPC flat rows into a Puzzle', () => {
    const puzzle = mapDailyPuzzle(dailyRows)

    expect(puzzle.id).toBe(4)
    expect(puzzle.puzzle_number).toBe(1)
    expect(puzzle.categories).toHaveLength(4)
    expect(puzzle.categories[0]).toEqual({
      id: 47,
      name: 'COFFEE SHOPS',
      difficulty: 1,
      items: ['ANDYTOWN', 'RITUAL', 'RÉVEILLE', 'SIGHTGLASS'],
    })
  })

  it('maps the by-number RPC nested object into a Puzzle', () => {
    const puzzle = mapPuzzleByNumber(byNumber)

    expect(puzzle.id).toBe(4)
    expect(puzzle.puzzle_number).toBe(1)
    expect(puzzle.categories).toHaveLength(4)
  })

  it('produces structurally identical puzzles from both RPC shapes', () => {
    expect(mapDailyPuzzle(dailyRows)).toEqual(mapPuzzleByNumber(byNumber))
  })

  it('omits date when the source does not provide one', () => {
    expect(mapDailyPuzzle(dailyRows).date).toBeUndefined()
    expect(mapPuzzleByNumber(byNumber).date).toBeUndefined()
  })

  it('populates date only when the source provides a real value', () => {
    const withDate = mapPuzzleByNumber({ ...byNumber, date: '2026-07-04' })
    expect(withDate.date).toBe('2026-07-04')

    const dailyWithDate = mapDailyPuzzle(dailyRows.map(row => ({ ...row, date: '2026-07-04' })))
    expect(dailyWithDate.date).toBe('2026-07-04')
  })

  it('passes through difficulty_tier when present', () => {
    expect(mapPuzzleByNumber({ ...byNumber, difficulty_tier: 2 }).difficulty_tier).toBe(2)
    expect(mapPuzzleByNumber(byNumber).difficulty_tier).toBeUndefined()
  })

  it('rejects a puzzle without exactly four categories', () => {
    expect(() =>
      mapPuzzleByNumber({ ...byNumber, categories: byNumber.categories.slice(0, 3) })
    ).toThrow(InvalidPuzzleError)
  })

  it('rejects a category without exactly four items', () => {
    const broken = {
      ...byNumber,
      categories: [
        { ...byNumber.categories[0], items: ['ONLY', 'THREE', 'ITEMS'] },
        ...byNumber.categories.slice(1),
      ],
    }
    expect(() => mapPuzzleByNumber(broken)).toThrow(InvalidPuzzleError)
  })

  it('rejects an empty daily response', () => {
    expect(() => mapDailyPuzzle([])).toThrow(InvalidPuzzleError)
  })
})
