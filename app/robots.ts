import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://lyashok.com/sitemap.xml',
    host: 'https://lyashok.com',
  }
}
