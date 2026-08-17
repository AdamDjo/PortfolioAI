import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { listPublicBookmarks } from '@/lib/bookmarks'
import config from '@payload-config'

import { BookmarkComposer } from './_components/bookmark-composer'
import { BookmarkGrid } from './_components/bookmark-grid'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Veille',
  description: 'Ma bibliothèque de liens techniques, triée par tags.',
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

async function WatchPage() {
  // Reading is public and the session only decides whether to show the form:
  // the two queries are independent.
  const [bookmarks, owner] = await Promise.all([listPublicBookmarks(), isOwner()])

  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">Veille active</p>
        <h1>Ma bibliothèque de liens, triée par tags.</h1>
        <p>
          Les références que je garde sous la main, avec leur aperçu. Filtre par tag pour retrouver
          une ressource en quelques secondes.
        </p>
      </header>
      {owner ? <BookmarkComposer /> : null}
      <BookmarkGrid bookmarks={bookmarks} />
    </div>
  )
}

export { WatchPage as default }
