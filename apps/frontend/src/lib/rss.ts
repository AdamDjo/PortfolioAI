/**
 * RSS 2.0 serialization.
 *
 * Hand-written rather than pulled from a library: a feed is a dozen known tags,
 * and the only thing that can genuinely go wrong is escaping. That part is
 * covered by tests, which is worth more here than a dependency.
 *
 * The feed matters beyond readers: it is the entry point any external
 * automation subscribes to, including the social scheduler.
 */

interface FeedItem {
  title: string
  /** Absolute URL of the article. Also used as the item's identifier. */
  link: string
  description: string | null
  /** ISO string. An item with no date is served without `pubDate`. */
  published: string | null
}

interface FeedOptions {
  title: string
  description: string
  /** Absolute URL of the page a reader should land on. */
  siteUrl: string
  /** Absolute URL of the feed itself, for the self-reference readers expect. */
  feedUrl: string
  language: string
  items: FeedItem[]
}

/**
 * Escapes the five characters XML reserves.
 *
 * Both quote forms are escaped even though these values only ever land in text
 * nodes: an article title holding a quote is ordinary, and a serializer that is
 * only correct in the position it happens to be used in today breaks the day it
 * is reused for an attribute.
 */
const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/**
 * RFC 822 date, which is what RSS requires — not ISO 8601.
 *
 * An unparseable value yields no element at all rather than `Invalid Date`,
 * which some readers reject for the whole feed.
 */
const toRfc822 = (iso: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date.toUTCString()
}

const renderItem = (item: FeedItem): string => {
  const published = toRfc822(item.published)

  return [
    '    <item>',
    `      <title>${escapeXml(item.title)}</title>`,
    `      <link>${escapeXml(item.link)}</link>`,
    // `isPermaLink="true"` is the default, but stating it tells a reader the
    // identifier is also a fetchable address, which it is.
    `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>`,
    item.description ? `      <description>${escapeXml(item.description)}</description>` : null,
    published ? `      <pubDate>${published}</pubDate>` : null,
    '    </item>',
  ]
    .filter((line) => line !== null)
    .join('\n')
}

const buildRssFeed = ({
  title,
  description,
  siteUrl,
  feedUrl,
  language,
  items,
}: FeedOptions): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>${escapeXml(language)}</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items.map(renderItem).join('\n')}
  </channel>
</rss>
`

export { buildRssFeed, escapeXml, type FeedItem }
