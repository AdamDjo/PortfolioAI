'use client'

import { AnimatePresence, m } from 'motion/react'
import Image from 'next/image'
import { useMemo, useState } from 'react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

import type { BookmarkView } from '@/lib/bookmarks'

const ALL_TAGS = 'Tous'
const COVER_TONES = ['violet', 'coral', 'blue', 'green', 'cyan', 'mono'] as const

/** Teinte stable par domaine : la même carte garde sa couleur d'un rendu à l'autre. */
function coverTone(domain: string) {
  let hash = 0
  for (const char of domain) hash = (hash * 31 + char.codePointAt(0)!) % 997
  return COVER_TONES[hash % COVER_TONES.length]
}

interface BookmarkGridProps {
  bookmarks: BookmarkView[]
}

/**
 * Grille filtrable des liens de veille.
 *
 * Les données arrivent déjà rendues par le serveur ; ce composant ne gère que le
 * filtre par tag et les transitions. Il ne peut ni ajouter ni supprimer un lien :
 * l'écriture passe par le formulaire réservé à l'administrateur.
 */
function BookmarkGrid({ bookmarks }: BookmarkGridProps) {
  const [activeTag, setActiveTag] = useState(ALL_TAGS)

  const tags = useMemo(() => {
    const all = new Set<string>()
    for (const bookmark of bookmarks) for (const tag of bookmark.tags) all.add(tag)
    return [ALL_TAGS, ...[...all].sort((a, b) => a.localeCompare(b, 'fr'))]
  }, [bookmarks])

  const visibleBookmarks = useMemo(
    () =>
      activeTag === ALL_TAGS
        ? bookmarks
        : bookmarks.filter((bookmark) => bookmark.tags.includes(activeTag)),
    [bookmarks, activeTag]
  )

  if (bookmarks.length === 0) {
    return <p className="veille-empty">Aucun lien publié pour l’instant.</p>
  }

  return (
    <>
      <div className="filter-row veille-tags" role="group" aria-label="Filtrer par tag">
        {tags.map((tag) => (
          <button
            className={tag === activeTag ? 'is-active' : undefined}
            key={tag}
            onClick={() => setActiveTag(tag)}
            type="button"
            aria-pressed={tag === activeTag}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="veille-grid">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleBookmarks.map((bookmark) => (
            <m.article
              className="veille-card"
              key={bookmark.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35, ease: EASE_OUT_QUINT }}
            >
              <a href={bookmark.url} target="_blank" rel="noreferrer">
                <BookmarkCover bookmark={bookmark} />
                <p>{bookmark.domain}</p>
                <h2>{bookmark.title}</h2>
                {bookmark.tags.length > 0 ? (
                  <span className="veille-tag-list">
                    {bookmark.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </span>
                ) : null}
              </a>
            </m.article>
          ))}
        </AnimatePresence>
      </div>
      {visibleBookmarks.length === 0 ? (
        <p className="veille-empty">Aucun lien avec ce tag pour l’instant.</p>
      ) : null}
    </>
  )
}

/**
 * Visuel de la carte : l'aperçu Open Graph quand il existe, sinon le favicon.
 *
 * L'image distante peut disparaître après coup ; en cas d'erreur de chargement on
 * bascule sur le favicon plutôt que de laisser un cadre vide.
 */
function BookmarkCover({ bookmark }: { bookmark: BookmarkView }) {
  const [previewFailed, setPreviewFailed] = useState(false)
  const showPreview = Boolean(bookmark.previewImageUrl) && !previewFailed

  if (showPreview) {
    return (
      <span className="veille-cover veille-cover-preview">
        <Image
          src={bookmark.previewImageUrl!}
          alt=""
          width={480}
          height={252}
          onError={() => setPreviewFailed(true)}
          // Les domaines distants ne sont pas connus à l'avance : l'optimiseur
          // Next exigerait une liste blanche que l'on ne peut pas maintenir.
          unoptimized
        />
      </span>
    )
  }

  return (
    <span className={`veille-cover veille-cover-${coverTone(bookmark.domain)}`}>
      <Image
        // `sz` is a hint: Google returns the closest size it holds, so
        // asking for 64 often yields 28px for a 40px slot. Requesting
        // 128 covers the 2x display density on high-DPI screens.
        src={`https://www.google.com/s2/favicons?domain=${bookmark.domain}&sz=128`}
        alt=""
        width={40}
        height={40}
        unoptimized
      />
    </span>
  )
}

export { BookmarkGrid }
