import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE_URL = 'https://frisconnections.lol'

type RouteConfig = {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}

const staticRoutes: RouteConfig[] = [
  { path: '/', changeFrequency: 'daily', priority: 1.0 },
  { path: '/archive', changeFrequency: 'daily', priority: 0.8 },
  { path: '/how-to-play', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/stats', changeFrequency: 'yearly', priority: 0.5 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticRoutes.map(route => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const { data: puzzles } = await supabase.rpc('frisc_get_past_puzzles')

  const puzzleEntries: MetadataRoute.Sitemap = (puzzles || []).map(
    (puzzle: { puzzle_number: number; last_presented: string | null }) => ({
      url: `${BASE_URL}/puzzle/${puzzle.puzzle_number}`,
      lastModified: puzzle.last_presented ? new Date(puzzle.last_presented) : new Date(),
      changeFrequency: 'never' as const,
      priority: 0.6,
    })
  )

  return [...staticEntries, ...puzzleEntries]
}
