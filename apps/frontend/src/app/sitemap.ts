import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

import type { MetadataRoute } from 'next'

/**
 * One entry per page per locale, each listing the other languages as alternates.
 *
 * The routes are enumerated here rather than derived from the filesystem: the
 * app has a fixed set of public pages, and a generated crawl would also pick up
 * the admin and the API, which must never be indexed.
 *
 * URLs come from `getPathname`, the helper the navigation uses, so a sitemap
 * entry can never drift from the URL a link points to.
 */
const ROUTES = [
  { path: '/', priority: 1 },
  { path: '/projets', priority: 0.8 },
  { path: '/a-propos', priority: 0.8 },
  { path: '/veille', priority: 0.6 },
  { path: '/outils-ia', priority: 0.6 },
  { path: '/contact', priority: 0.6 },
  { path: '/mentions-legales', priority: 0.2 },
  { path: '/confidentialite', priority: 0.2 },
] as const

const BASE = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

const url = (path: string, locale: (typeof routing.locales)[number]) =>
  `${BASE}${getPathname({ href: path, locale })}`

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return ROUTES.flatMap(({ path, priority }) => {
    const languages: Record<string, string> = {}
    for (const locale of routing.locales) languages[locale] = url(path, locale)
    languages['x-default'] = url(path, routing.defaultLocale)

    return routing.locales.map((locale) => ({
      url: url(path, locale),
      lastModified,
      priority,
      alternates: { languages },
    }))
  })
}
