import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Puzzle Archive - FrisConnections',
  description:
    'Browse and replay every past FrisConnections puzzle. Test your San Francisco knowledge with daily word puzzles from the archive.',
}

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return children
}
