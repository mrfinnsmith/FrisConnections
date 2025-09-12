import { supabase } from './supabase'
import { Puzzle } from '@/types/game'

export async function getTodaysPuzzle(): Promise<Puzzle | null> {
  try {
    const { data, error } = await supabase.rpc('frisc_get_daily_puzzle')

    if (error) {
      console.error('Error fetching puzzle:', error)
      return null
    }

    if (!data || data.length !== 4) {
      return null
    }

    const puzzleData = data[0]
    const puzzle: Puzzle = {
      id: puzzleData.puzzle_id,
      date: new Date().toISOString().split('T')[0],
      puzzle_number: puzzleData.puzzle_number,
      categories: data.map((row: any) => ({
        id: row.category_id,
        name: row.category_name,
        difficulty: row.difficulty,
        items: row.items
      }))
    }

    return puzzle
  } catch (error) {
    console.error('Error fetching puzzle:', error)
    return null
  }
}