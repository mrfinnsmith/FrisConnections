import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Statistics - FrisConnections',
  description:
    'View your FrisConnections game statistics including win rate, current streak, difficulty breakdown, and game history.',
}

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children
}
