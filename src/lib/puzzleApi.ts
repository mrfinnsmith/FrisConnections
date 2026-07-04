import { supabase } from './supabase'
import { Puzzle } from '@/types/game'
import { mapDailyPuzzle } from './puzzleMapper'

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

    return mapDailyPuzzle(data)
  } catch (error) {
    console.error('Error fetching puzzle:', error)
    return null
  }
}
