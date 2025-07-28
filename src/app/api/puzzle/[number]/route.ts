import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { number: string } }
) {
    try {
        const puzzleNumber = parseInt(params.number)
        console.log('Fetching puzzle number:', puzzleNumber)

        if (isNaN(puzzleNumber)) {
            return NextResponse.json({ error: 'Invalid puzzle number' }, { status: 400 })
        }

        // Get puzzle by number with categories using RPC function
        const { data, error } = await supabase.rpc('get_puzzle_by_number', {
            puzzle_num: puzzleNumber
        })

        console.log('RPC response:', { data, error })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 })
        }

        // Group categories by puzzle
        const puzzle = {
            id: data[0].id,
            puzzle_number: data[0].puzzle_number,
            categories: data.map(row => ({
                id: row.category_id,
                name: row.category_name,
                difficulty: row.difficulty,
                items: row.items
            }))
        }

        // Validate puzzle has exactly 4 categories
        if (puzzle.categories.length !== 4) {
            return NextResponse.json({ error: 'Puzzle data incomplete' }, { status: 500 })
        }

        return NextResponse.json({
            id: puzzle.id,
            puzzle_number: puzzle.puzzle_number,
            categories: puzzle.categories,
            date: new Date().toISOString().split('T')[0] // Current date for past puzzles
        })
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to fetch puzzle'
        }, { status: 500 })
    }
}