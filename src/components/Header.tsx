'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  const HeaderTag = isHome ? 'h1' : 'div'

  return (
    <header className="page-header w-full py-3 mb-6">
      <div className="mx-auto px-2 sm:px-4 w-full max-w-[1008px]">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <Link href="/">
            <HeaderTag className="text-3xl sm:text-4xl font-bold page-text">
              FrisConnections
            </HeaderTag>
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
            <Link href="/about" className="page-link hover:underline">
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
