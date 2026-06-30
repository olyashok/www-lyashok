import type { MetadataRoute } from 'next'
import { listEntries, slugToPath } from '@/lib/content'

const BASE_URL = 'https://lyashok.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await listEntries()
  const now = new Date()

  return entries.map((entry) => ({
    url: `${BASE_URL}${slugToPath(entry.slug)}`,
    lastModified: entry.frontmatter.date ?? now,
    changeFrequency: entry.slug.length === 0 ? 'weekly' : 'monthly',
    priority: entry.slug.length === 0 ? 1 : 0.7,
  }))
}
