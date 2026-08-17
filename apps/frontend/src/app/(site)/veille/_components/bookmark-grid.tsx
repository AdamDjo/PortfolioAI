'use client'

import { AnimatePresence, m } from 'motion/react'
import Image from 'next/image'
import { useMemo, useState } from 'react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

import { VEILLE_CONTENT } from '../_content'

import type { BookmarkView } from '@/lib/bookmarks'

const ALL_TAGS = VEILLE_CONTENT.filter.allTag
const COVER_TONES = ['violet', 'coral', 'blue', 'green', 'cyan', 'mono'] as const

/** Stable hue per domain: the same card keeps its colour from render to render. */
function coverTone(domain: string) {
  let hash = 0
  for (const char of domain) hash = (hash * 31 + char.codePointAt(0)!) % 997
  return COVER_TONES[hash % COVER_TONES.length]
}

interface BookmarkGridProps {
  bookmarks: BookmarkView[]
}

/**
 * Filterable grid of the veille links.
 *
 * The data arrives already rendered by the server; this component only handles
 * the tag filter and the transitions. It can neither add nor delete a link:
 * writing goes through the form reserved for the admin.
 */
function BookmarkGrid({ bookmarks }: BookmarkGridProps) {
  const [activeTag, setActiveTag] = useState<string>(ALL_TAGS)

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
    return <p className="veille-empty">{VEILLE_CONTENT.grid.emptyState}</p>
  }

  return (
    <>
      <div
        className="filter-row veille-tags"
        role="group"
        aria-label={VEILLE_CONTENT.filter.ariaLabel}
      >
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
        <p className="veille-empty">{VEILLE_CONTENT.grid.emptyFilteredState}</p>
      ) : null}
    </>
  )
}

/**
 * Card visual: the Open Graph preview when there is one, the favicon otherwise.
 *
 * The remote image can disappear later; on a load error it falls back to the
 * favicon rather than leaving an empty frame.
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
          // Remote domains are not known in advance: Next's optimiser would
          // require an allowlist that cannot be maintained.
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
