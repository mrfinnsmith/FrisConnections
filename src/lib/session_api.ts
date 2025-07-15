import { supabase } from './supabase'
import { SessionData, GuessData } from '@/types/game'

export async function createSession(sessionId: string, puzzleId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('anonymous_sessions')
      .insert({
        session_id: sessionId,
        puzzle_id: puzzleId,
        completed: false,
        attempts_used: 0,
        solved_categories: []
      })

    return !error
  } catch (error) {
    console.error('Error creating session:', error)
    return false
  }
}

export async function updateSession(
  sessionId: string, 
  updates: Partial<SessionData>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('anonymous_sessions')
      .update(updates)
      .eq('session_id', sessionId)

    return !error
  } catch (error) {
    console.error('Error updating session:', error)
    return false
  }
}

export async function completeSession(
  sessionId: string,
  attemptsUsed: number,
  solvedCategories: number[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('anonymous_sessions')
      .update({
        completed: true,
        attempts_used: attemptsUsed,
        solved_categories: solvedCategories,
        end_time: new Date().toISOString()
      })
      .eq('session_id', sessionId)

    return !error
  } catch (error) {
    console.error('Error completing session:', error)
    return false
  }
}

export async function recordGuess(guessData: GuessData): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('anonymous_guesses')
      .insert({
        session_id: guessData.session_id,
        puzzle_id: guessData.puzzle_id,
        guessed_items: guessData.guessed_items,
        item_difficulties: guessData.item_difficulties,
        is_correct: guessData.is_correct,
        category_id: guessData.category_id,
        attempt_number: guessData.attempt_number
      })

    return !error
  } catch (error) {
    console.error('Error recording guess:', error)
    return false
  }
}

export async function getSessionExists(sessionId: string, puzzleId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('anonymous_sessions')
      .select('session_id')
      .eq('session_id', sessionId)
      .eq('puzzle_id', puzzleId)
      .single()

    return !error && !!data
  } catch (error) {
    return false
  }
}