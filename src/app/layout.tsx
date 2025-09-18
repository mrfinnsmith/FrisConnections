import type { Metadata } from 'next'
import Link from 'next/link'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { GameMainErrorFallback } from '@/components/ErrorFallbacks'
import './globals.css'

export const metadata: Metadata = {
  title: 'FrisConnections - Daily San Francisco Word Puzzle',
  description:
    'Daily San Francisco word puzzle game. Find connections between 16 words in 4 groups. New puzzle every day featuring SF neighborhoods, food, culture, and local knowledge.',
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
      'Daily San Francisco word puzzle game. Find connections between 16 words in 4 groups. New puzzle every day featuring SF neighborhoods, food, culture, and local knowledge.',
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
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <header className="text-center mb-6">
              <Link href="/" className="block">
                <h1 className="text-4xl font-bold page-text mb-1">FrisConnections</h1>
              </Link>
              <nav className="mt-3">
                <Link href="/past" className="page-link hover:underline text-sm mr-4">
                  Past FrisConnections
                </Link>
                <Link href="/stats" className="page-link hover:underline text-sm mr-4">
                  Statistics
                </Link>
                <Link href="/about" className="page-link hover:underline text-sm mr-4">
                  About
                </Link>
                <Link href="/how-to-play" className="page-link hover:underline text-sm">
                  How to Play
                </Link>
              </nav>
            </header>
            <ErrorBoundary fallback={<GameMainErrorFallback />}>
              <main>{children}</main>
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
