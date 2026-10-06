import { ImageResponse } from 'next/og'
import { hasLocale } from 'next-intl'

import { routing } from '@/i18n/routing'
import { readPublishedPost } from '@/lib/posts'

/**
 * The image LinkedIn, X and Slack show when an article is shared.
 *
 * Generated from the title rather than from the article's cover, and that is a
 * deliberate limit: this runs at build time, when nothing is serving the uploaded
 * media, so a cover-based card would depend on a URL that cannot be fetched yet.
 * A typographic card always renders, and the cover stays what it is — the visual
 * at the top of the article.
 *
 * No font is loaded: the default face is enough for one line of display text, and
 * fetching a font here would make every article's card depend on a network call
 * during the build.
 */

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Adem — Blog'

/** Mirrors the site's dark ground and single accent. */
const BG = '#0b0d11'
const FG = '#f3f6fb'
const MUTED = '#8e97a8'
const ACCENT = '#7c6cf0'

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const post = hasLocale(routing.locales, locale) ? await readPublishedPost(locale, slug) : null

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: BG,
        padding: '72px 80px',
        // The accent reads as a spine down the left edge rather than as a
        // border, so a title of any length stays aligned to it.
        borderLeft: `16px solid ${ACCENT}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          color: ACCENT,
          fontSize: 26,
          letterSpacing: 6,
          textTransform: 'uppercase',
        }}
      >
        Adem — Blog
      </div>
      <div
        style={{
          display: 'flex',
          color: FG,
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: -2,
        }}
      >
        {post?.title ?? 'Adem'}
      </div>
      <div style={{ display: 'flex', color: MUTED, fontSize: 28 }}>
        {post?.excerpt ?? 'Frontend engineering, written down.'}
      </div>
    </div>,
    size
  )
}
