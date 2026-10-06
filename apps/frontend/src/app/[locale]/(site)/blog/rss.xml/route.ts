import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { listFeedEntries } from '@/lib/posts'
import { buildRssFeed } from '@/lib/rss'
import { absoluteUrl } from '@/lib/site-url'

/**
 * The blog's feed, one per language.
 *
 * It lives under the locale prefix because its contents are localized, which also
 * keeps it out of the locale negotiation: the proxy's matcher excludes any path
 * holding a dot, so this address is never redirected — it is linked directly from
 * the index page's metadata.
 *
 * The articles come from the same cached read the pages use, so a request costs a
 * database query only after a publish.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
): Promise<Response> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return new Response('Not found', { status: 404 })

  const [t, entries] = await Promise.all([
    getTranslations({ locale, namespace: 'Blog' }),
    listFeedEntries(locale),
  ])

  const xml = buildRssFeed({
    title: t('feedTitle'),
    description: t('metaDescription'),
    siteUrl: absoluteUrl(getPathname({ href: '/blog', locale })),
    feedUrl: absoluteUrl(getPathname({ href: '/blog/rss.xml', locale })),
    language: locale,
    items: entries.map((entry) => ({
      title: entry.title,
      link: absoluteUrl(getPathname({ href: `/blog/${entry.slug}`, locale })),
      // A summary, never the whole article: the canonical copy is the page, and a
      // full-text feed is an invitation to republish it elsewhere.
      description: entry.description,
      published: entry.published,
    })),
  })

  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
    },
  })
}
