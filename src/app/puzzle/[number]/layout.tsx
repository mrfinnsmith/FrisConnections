import type { Metadata } from 'next'

interface PuzzleLayoutProps {
  children: React.ReactNode
  params: { number: string }
}

export function generateMetadata({ params }: PuzzleLayoutProps): Metadata {
  const puzzleNumber = params.number
  return {
    title: `Puzzle #${puzzleNumber} - FrisConnections`,
    description: `Play FrisConnections Puzzle #${puzzleNumber}. Find four groups of four San Francisco-themed words.`,
  }
}

export default function PuzzleLayout({ children }: PuzzleLayoutProps) {
  return children
}
