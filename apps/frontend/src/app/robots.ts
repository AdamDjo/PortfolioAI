import type { MetadataRoute } from 'next'

/**
 * The admin and the API are disallowed rather than merely unlinked: Payload
 * serves both, and neither has anything to offer a crawler.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${base}/sitemap.xml`,
  }
}
