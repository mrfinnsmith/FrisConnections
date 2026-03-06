import { MetadataRoute } from 'next'

const BASE_URL = 'https://frisconnections.lol'

type RouteConfig = {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}

const routes: RouteConfig[] = [
  { path: '/', changeFrequency: 'daily', priority: 1.0 },
  { path: '/archive', changeFrequency: 'daily', priority: 0.8 },
  { path: '/how-to-play', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/stats', changeFrequency: 'yearly', priority: 0.5 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(route => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
