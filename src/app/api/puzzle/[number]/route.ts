import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface PuzzleQueryRow {
    id: number
    puzzle_number: number
    category_id: number
    category_name: string
    difficulty: number
    items: string[]
}

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

        const { data, error } = await supabase
            .from('puzzles')
            .select(`
        id,
        puzzle_number,
        categories (
          id,
          name,
          difficulty,
          items
        )
      `)
            .eq('puzzle_number', puzzleNumber)
            .single()

        if (error || !data) {
            return NextResponse.json(
                { error: 'Puzzle not found' },
                { status: 404 }
            )
        }

        // Validate puzzle has exactly 4 categories
        if (!data.categories || data.categories.length !== 4) {
            return NextResponse.json(
                { error: 'Puzzle incomplete' },
                { status: 404 }
            )
        }

        // Transform to expected format
        const puzzle = {
            id: data.id,
            puzzle_number: data.puzzle_number,
            categories: data.categories.map((category: any) => ({
                id: category.id,
                name: category.name,
                difficulty: category.difficulty,
                items: category.items
            }))
        }

        return NextResponse.json(puzzle)
    } catch (error) {
        console.error('Error fetching puzzle:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}