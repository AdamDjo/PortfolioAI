import { describe, expect, it } from 'vitest'

import { buildRssFeed, escapeXml, type FeedItem } from './rss'

const item = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  title: 'Server Components in practice',
  link: 'https://adem.dev/en/blog/server-components-in-practice',
  description: 'Where data is read, and what that changes.',
  published: '2026-09-20T08:30:00.000Z',
  ...overrides,
})

const feed = (items: FeedItem[]) =>
  buildRssFeed({
    title: 'Adem — Blog',
    description: 'Articles on frontend engineering.',
    siteUrl: 'https://adem.dev/en/blog',
    feedUrl: 'https://adem.dev/en/blog/rss.xml',
    language: 'en',
    items,
  })

describe('escapeXml', () => {
  it('escapes the five reserved characters', () => {
    expect(escapeXml(`a & b < c > d " e ' f`)).toBe('a &amp; b &lt; c &gt; d &quot; e &apos; f')
  })

  /*
   * The ordering bug this guards against: escaping the ampersand last turns the
   * `&` of `&lt;` into `&amp;lt;`, and every reader then shows the markup.
   */
  it('does not double-escape its own output', () => {
    expect(escapeXml('<title>')).toBe('&lt;title&gt;')
  })
})

describe('buildRssFeed', () => {
  it('opens with the XML declaration, with nothing before it', () => {
    expect(feed([item()]).startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
  })

  it('declares the feed as its own source, which readers use to resubscribe', () => {
    expect(feed([])).toContain(
      '<atom:link href="https://adem.dev/en/blog/rss.xml" rel="self" type="application/rss+xml" />'
    )
  })

  it('writes dates in RFC 822, not ISO 8601', () => {
    expect(feed([item()])).toContain('<pubDate>Sun, 20 Sep 2026 08:30:00 GMT</pubDate>')
  })

  it('omits pubDate rather than serving an invalid date', () => {
    for (const published of [null, 'not-a-date']) {
      expect(feed([item({ published })])).not.toContain('<pubDate>')
    }
  })

  it('omits an absent description instead of writing an empty element', () => {
    expect(feed([item({ description: null })])).not.toContain('<description></description>')
  })

  it('escapes the article title, so a quote or an ampersand cannot break the feed', () => {
    const xml = feed([item({ title: `Payload & Next: "drafts" <explained>` })])

    expect(xml).toContain('<title>Payload &amp; Next: &quot;drafts&quot; &lt;explained&gt;</title>')
    expect(xml).not.toContain('<explained>')
  })

  it('identifies each item by its own address', () => {
    const xml = feed([item()])

    expect(xml).toContain(
      '<guid isPermaLink="true">https://adem.dev/en/blog/server-components-in-practice</guid>'
    )
  })

  it('serves a valid empty feed when nothing is published yet', () => {
    const xml = feed([])

    expect(xml).toContain('<channel>')
    expect(xml).not.toContain('<item>')
  })

  it('keeps one item per entry, in the order given', () => {
    const xml = feed([item({ title: 'First' }), item({ title: 'Second' })])

    expect(xml.indexOf('First')).toBeLessThan(xml.indexOf('Second'))
    expect(xml.match(/<item>/g)).toHaveLength(2)
  })
})
