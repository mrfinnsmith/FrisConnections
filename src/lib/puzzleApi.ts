import { supabase } from './supabase'
import { Puzzle } from '@/types/game'

export async function getTodaysPuzzle(): Promise<Puzzle | null> {
  const today = new Date().toISOString().split('T')[0]
  
  try {
    const { data: puzzle, error } = await supabase
      .from('puzzles')
      .select(`
        id,
        date,
        puzzle_number,
        categories (
          id,
          name,
          difficulty,
          items
        )
      `)
      .eq('date', today)
      .eq('published', true)
      .single()

    if (error) {
      console.error('Error fetching puzzle:', error)
      return null
    }

    return puzzle as Puzzle
  } catch (error) {
    console.error('Error fetching puzzle:', error)
    return null
  }
}