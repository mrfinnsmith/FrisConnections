import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://frisconnections.lol',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        }
    ]
}