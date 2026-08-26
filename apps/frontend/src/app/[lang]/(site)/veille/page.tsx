import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { listPublicBookmarks } from '@/lib/bookmarks'
import { buildPageMetadata } from '@/lib/i18n/metadata'
import { resolveLocale } from '@/lib/i18n/server'
import { listAllTags } from '@/lib/tags'
import config from '@payload-config'

import { BookmarkComposer } from './_components/bookmark-composer'
import { BookmarkGrid } from './_components/bookmark-grid'
import { getVeilleContent } from './_content'

import type { Metadata } from 'next'

export async function generateMetadata({ params }: PageProps<'/[lang]/veille'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const { metadata } = getVeilleContent(locale)
  return buildPageMetadata({ locale, path: '/veille', ...metadata })
}

/**
 * The list changes as soon as a link is added: render on demand rather than
 * freezing the page at build time.
 */
export const dynamic = 'force-dynamic'

/** True only when the request carries a valid Payload session. */
async function isOwner(): Promise<boolean> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return Boolean(user)
}

async function WatchPage({ params }: PageProps<'/[lang]/veille'>) {
  const locale = await resolveLocale(params)
  // Reading is public and the session only decides whether the editing controls
  // are rendered: the queries are independent.
  const [bookmarks, owner, allTags] = await Promise.all([
    listPublicBookmarks(),
    isOwner(),
    listAllTags(),
  ])
  const { heading } = getVeilleContent(locale)

  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">{heading.eyebrow}</p>
        <h1>{heading.title}</h1>
        <p>{heading.lead}</p>
      </header>
      {owner ? <BookmarkComposer tags={allTags} /> : null}
      <BookmarkGrid bookmarks={bookmarks} allTags={allTags} canEdit={owner} />
    </div>
  )
}

export { WatchPage as default }
