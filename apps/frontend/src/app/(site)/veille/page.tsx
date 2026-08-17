import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { BookmarkComposer } from '@/components/veille/bookmark-composer'
import { BookmarkGrid } from '@/components/veille/bookmark-grid'
import { listPublicBookmarks } from '@/lib/bookmarks'
import config from '@payload-config'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Veille',
  description: 'Ma bibliothèque de liens techniques, triée par tags.',
}

/**
 * La liste change dès qu'un lien est ajouté : on rend à la demande plutôt que de
 * figer la page au build.
 */
export const dynamic = 'force-dynamic'

/** Vrai uniquement si la requête porte une session Payload valide. */
async function isOwner(): Promise<boolean> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return Boolean(user)
}

async function WatchPage() {
  // La lecture est publique, la session ne sert qu'à décider d'afficher le
  // formulaire : les deux requêtes sont indépendantes.
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
