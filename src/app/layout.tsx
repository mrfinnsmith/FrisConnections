import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Frisconnections',
  description: 'A daily SF-themed word puzzle game',
  keywords: ['puzzle', 'game', 'san francisco', 'connections', 'word game'],
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