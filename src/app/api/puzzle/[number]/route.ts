import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
    request: NextRequest,
    { params }: { params: { number: string } }
) {
    try {
        const puzzleNumber = parseInt(params.number)

        if (isNaN(puzzleNumber)) {
            return NextResponse.json(
                { error: 'Invalid puzzle number' },
                { status: 400 }
            )
        }

        const { data: puzzle, error } = await supabase.rpc('get_puzzle_by_number', {
            puzzle_num: puzzleNumber
        })

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        if (!puzzle) {
            return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 })
        }

        return NextResponse.json(puzzle)
    } catch (error) {
        console.error('API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}