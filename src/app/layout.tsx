import type { Metadata } from 'next'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { GameMainErrorFallback } from '@/components/ErrorFallbacks'
import Header from '@/components/Header'
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
          <Header />
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
