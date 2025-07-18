import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Frisconnections - Daily San Francisco Word Puzzle',
  description: 'Daily San Francisco word puzzle game. Find connections between 16 words in 4 groups. New puzzle every day featuring SF neighborhoods, food, culture, and local knowledge.',
  keywords: ['san francisco puzzle', 'sf word game', 'daily puzzle', 'connections game', 'bay area trivia', 'puzzle', 'game', 'san francisco', 'connections', 'word game'],
  openGraph: {
    title: 'Frisconnections - Daily San Francisco Word Puzzle',
    description: 'Daily San Francisco word puzzle game. Find connections between 16 words in 4 groups. New puzzle every day featuring SF neighborhoods, food, culture, and local knowledge.',
    url: 'https://frisconnections.lol',
    type: 'website',
    images: [
      {
        url: 'https://frisconnections.lol/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Frisconnections - Daily San Francisco Word Puzzle Game'
      }
    ]
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="FUbmj+ShHkEoUzhFgwsmgg" async></script>
      </head>
      <body className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <header className="text-center mb-6">
            <h1 className="text-4xl font-bold text-black mb-1">
              Frisconnections
            </h1>
            <p className="text-gray-600 text-sm">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'America/Los_Angeles'
              })}
            </p>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}