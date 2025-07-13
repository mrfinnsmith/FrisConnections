import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Frisconnections',
  description: 'A daily SF-themed word puzzle game',
  keywords: ['puzzle', 'game', 'san francisco', 'connections', 'word game'],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
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
      </head>
      <body className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Frisconnections
            </h1>
            <p className="text-gray-600">
              A daily San Francisco-themed word puzzle
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