import { DIFFICULTY_TIER_COLORS, DIFFICULTY_TIER_NAMES } from '@/types/game'

interface DifficultyBadgeProps {
  tier: number | null
  showLabel?: boolean
}

export default function DifficultyBadge({ tier, showLabel = true }: DifficultyBadgeProps) {
  console.log('DifficultyBadge rendered with tier:', tier)
  if (!tier) return null

  const name = DIFFICULTY_TIER_NAMES[tier as keyof typeof DIFFICULTY_TIER_NAMES]

  // Use inline classes to ensure Tailwind compiles them
  const getColors = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-green-100 text-green-800 border border-green-200'
      case 2: return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 3: return 'bg-red-100 text-red-800 border border-red-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  return (
    <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${getColors(tier)}`}>
      {showLabel ? `Difficulty: ${name}` : name}
    </span>
  )
}
