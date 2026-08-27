'use client'

import { AnimatePresence, m } from 'motion/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

import { CardTagEditor } from './card-tag-editor'

import type { BookmarkView } from '@/lib/bookmarks'
import type { TagView } from '@/lib/tags'

/**
 * Sentinel for the unfiltered state, kept out of the tag namespace so it cannot
 * collide with a real tag. A stable value rather than the translated label: the
 * filter must not change meaning when the visitor switches language.
 */
const ALL_TAGS = '\u0000all'
const COVER_TONES = ['violet', 'coral', 'blue', 'green', 'cyan', 'mono'] as const

/** Stable hue per domain: the same card keeps its colour from render to render. */
function coverTone(domain: string) {
  let hash = 0
  for (const char of domain) hash = (hash * 31 + char.codePointAt(0)!) % 997
  return COVER_TONES[hash % COVER_TONES.length]
}

interface BookmarkGridProps {
  bookmarks: BookmarkView[]
  /** Whole vocabulary, offered by the per-card editor. Empty for a visitor. */
  allTags: TagView[]
  /** Only the owner may retag a link; a visitor gets a read-only grid. */
  canEdit: boolean
}

/**
 * Filterable grid of the veille links.
 *
 * The data arrives already rendered by the server; this component only handles
 * the tag filter and the transitions. It can neither add nor delete a link:
 * writing goes through the form reserved for the admin.
 */
function BookmarkGrid({ bookmarks, allTags, canEdit }: BookmarkGridProps) {
  const locale = useLocale()
  const t = useTranslations('Veille')
  const router = useRouter()
  const [activeTag, setActiveTag] = useState<string>(ALL_TAGS)

  // Only the tags actually carried by a link: a filter returning nothing has no
  // value. The editors list the whole vocabulary instead, so a fresh tag is still
  // reachable.
  const tags = useMemo(() => {
    const all = new Set<string>()
    for (const bookmark of bookmarks) for (const tag of bookmark.tags) all.add(tag)
    return [ALL_TAGS, ...[...all].sort((a, b) => a.localeCompare(b, locale))]
  }, [bookmarks, locale])

  const visibleBookmarks = useMemo(
    () =>
      activeTag === ALL_TAGS
        ? bookmarks
        : bookmarks.filter((bookmark) => bookmark.tags.includes(activeTag)),
    [bookmarks, activeTag]
  )

  if (bookmarks.length === 0) {
    return <p className="veille-empty">{t('emptyState')}</p>
  }

  return (
    <>
      <div className="filter-row veille-tags" role="group" aria-label={t('filterAriaLabel')}>
        {tags.map((tag) => (
          <button
            className={tag === activeTag ? 'is-active' : undefined}
            key={tag}
            onClick={() => setActiveTag(tag)}
            type="button"
            aria-pressed={tag === activeTag}
          >
            {tag === ALL_TAGS ? t('allTag') : tag}
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
              {canEdit ? (
                <CardTagEditor
                  bookmarkId={bookmark.id}
                  tags={allTags}
                  selectedIds={bookmark.tagIds}
                  onSaved={() => router.refresh()}
                />
              ) : null}
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
        <p className="veille-empty">{t('emptyFilteredState')}</p>
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
