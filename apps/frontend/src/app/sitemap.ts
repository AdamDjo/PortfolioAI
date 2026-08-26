import { DEFAULT_LOCALE, LOCALES, localizePath } from '@/lib/i18n/config'

import type { MetadataRoute } from 'next'

/**
 * One entry per page per locale, each listing the other languages as
 * alternates.
 *
 * The routes are enumerated here rather than derived from the filesystem: the
 * app has a fixed set of public pages, and a generated crawl would also pick up
 * the admin and the API, which must never be indexed.
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
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
  const lastModified = new Date()

  return ROUTES.flatMap(({ path, priority }) => {
    const languages: Record<string, string> = {}
    for (const locale of LOCALES) languages[locale] = `${base}${localizePath(locale, path)}`
    languages['x-default'] = `${base}${localizePath(DEFAULT_LOCALE, path)}`

    return LOCALES.map((locale) => ({
      url: `${base}${localizePath(locale, path)}`,
      lastModified,
      priority,
      alternates: { languages },
    }))
  })
}
