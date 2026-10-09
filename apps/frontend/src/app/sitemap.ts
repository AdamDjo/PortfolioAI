import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { listPublishedPosts } from '@/lib/posts'
import { SITE_URL } from '@/lib/site-url'

import type { MetadataRoute } from 'next'

/**
 * One entry per page per locale, each listing the other languages as alternates.
 *
 * The fixed routes are enumerated here rather than derived from the filesystem:
 * the app has a known set of public pages, and a generated crawl would also pick
 * up the admin and the API, which must never be indexed. Articles are the
 * exception and come from the database — they are the one part of the site that
 * grows without a deploy.
 *
 * URLs come from `getPathname`, the helper the navigation uses, so a sitemap
 * entry can never drift from the URL a link points to.
 */
const ROUTES = [
  { path: '/', priority: 1 },
  { path: '/parcours', priority: 0.8 },
  { path: '/blog', priority: 0.8 },
  { path: '/veille', priority: 0.6 },
  { path: '/veille/outils-ia', priority: 0.6 },
  { path: '/contact', priority: 0.6 },
  { path: '/mentions-legales', priority: 0.2 },
  { path: '/confidentialite', priority: 0.2 },
] as const

const url = (path: string, locale: (typeof routing.locales)[number]) =>
  `${SITE_URL}${getPathname({ href: path, locale })}`

/** The `languages` map plus `x-default`, shared by every entry for one page. */
const alternatesFor = (path: string) => {
  const languages: Record<string, string> = {}
  for (const locale of routing.locales) languages[locale] = url(path, locale)
  languages['x-default'] = url(path, routing.defaultLocale)
  return { languages }
}

/** One entry per locale for a single page. */
const entriesFor = (path: string, priority: number, lastModified: Date): MetadataRoute.Sitemap => {
  const alternates = alternatesFor(path)

  return routing.locales.map((locale) => ({
    url: url(path, locale),
    lastModified,
    priority,
    alternates,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  /*
   * Articles are read in one language only: `slug` and `updatedAt` are not
   * localized, so the other locale would return the same addresses and the
   * same dates for twice the queries.
   */
  const posts = await listPublishedPosts(routing.defaultLocale)

  return [
    ...ROUTES.flatMap(({ path, priority }) => entriesFor(path, priority, now)),
    /*
     * An article's own last-modified date, not the build date: telling a crawler
     * that every article changed on every deploy is how a sitemap stops being
     * believed.
     */
    ...posts.flatMap((post) => entriesFor(`/blog/${post.slug}`, 0.7, new Date(post.updatedAt))),
  ]
}
