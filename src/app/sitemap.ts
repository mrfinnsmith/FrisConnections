import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

function getRoutes(): string[] {
  const appDir = path.join(process.cwd(), 'src/app')
  const routes = ['/']

  const scanDir = (dir: string, basePath: string = '') => {
    const items = fs.readdirSync(dir, { withFileTypes: true })

    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith('_') && item.name !== 'api') {
        const routePath = `${basePath}/${item.name}`
        const fullPath = path.join(dir, item.name)

        // Check if directory contains a page.tsx file
        if (fs.existsSync(path.join(fullPath, 'page.tsx'))) {
          routes.push(routePath)
        }
      }
    }
  }

  scanDir(appDir)
  return routes
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = getRoutes()

  return routes.map(route => ({
    url: `https://frisconnections.lol${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'daily' : 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }))
}
