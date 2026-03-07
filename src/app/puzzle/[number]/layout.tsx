import type { Metadata } from 'next'

interface PuzzleLayoutProps {
  children: React.ReactNode
  params: { number: string }
}

export function generateMetadata({ params }: PuzzleLayoutProps): Metadata {
  const puzzleNumber = params.number
  const title = `Puzzle #${puzzleNumber} - FrisConnections`
  const description = `Play FrisConnections Puzzle #${puzzleNumber}. Find four groups of four San Francisco-themed words.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://frisconnections.lol/puzzle/${puzzleNumber}`,
      type: 'website',
      images: [
        {
          url: 'https://frisconnections.lol/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://frisconnections.lol/og-image.png'],
    },
  }
}

export default function PuzzleLayout({ children }: PuzzleLayoutProps) {
  return children
}
