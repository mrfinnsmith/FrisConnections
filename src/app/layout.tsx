import type { Metadata } from 'next'
import Link from 'next/link'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { GameMainErrorFallback } from '@/components/ErrorFallbacks'
import './globals.css'

export const metadata: Metadata = {
  title: 'FrisConnections - Daily San Francisco Word Puzzle',
  description:
    'Daily San Francisco word puzzle. Find connections between 16 words in 4 groups. New puzzle daily featuring SF neighborhoods, food, and culture.',
  keywords: [
    'san francisco puzzle',
    'sf word game',
    'daily puzzle',
    'connections game',
    'bay area trivia',
    'puzzle',
    'game',
    'san francisco',
    'connections',
    'word game',
  ],
  openGraph: {
    title: 'FrisConnections - Daily San Francisco Word Puzzle',
    description:
      'Daily San Francisco word puzzle. Find connections between 16 words in 4 groups. New puzzle daily featuring SF neighborhoods, food, and culture.',
    url: 'https://frisconnections.lol',
    type: 'website',
    images: [
      {
        url: 'https://frisconnections.lol/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FrisConnections - Daily San Francisco Word Puzzle Game',
      },
    ],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://frisconnections.lol" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-WV0Z43D7BR"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', 'G-WV0Z43D7BR');
     `,
          }}
        />
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="FUbmj+ShHkEoUzhFgwsmgg"
          async
        ></script>
      </head>
      <body className="min-h-screen page-container">
        <ErrorBoundary>
          <header className="page-header w-full py-3 mb-6">
            <div className="mx-auto px-2 sm:px-4 w-full max-w-[1008px]">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                <Link href="/">
                  <h1 className="text-3xl sm:text-4xl font-bold page-text">FrisConnections</h1>
                </Link>
                <nav className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
                  <Link href="/past" className="page-link hover:underline">
                    Past Puzzles
                  </Link>
                  <Link href="/stats" className="page-link hover:underline">
                    Stats
                  </Link>
                  <Link href="/how-to-play" className="page-link hover:underline">
                    How to Play
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <div className="mx-auto px-2 sm:px-4 w-full max-w-[1008px]">
            <ErrorBoundary fallback={<GameMainErrorFallback />}>
              <main>{children}</main>
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
