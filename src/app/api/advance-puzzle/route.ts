import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { data, error } = await supabase.rpc('frisc_assign_daily_puzzle')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      newPuzzleId: data,
    })
  } catch (_error) {
    return NextResponse.json(
      {
        error: 'Failed to advance puzzle',
      },
      { status: 500 }
    )
  }
}
