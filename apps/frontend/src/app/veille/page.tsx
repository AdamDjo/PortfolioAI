'use client'

import { Link2, Plus, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import Image from 'next/image'
import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

interface Bookmark {
  id: string
  url: string
  domain: string
  name: string
  tags: string[]
}

const STORAGE_KEY = 'adem-veille-bookmarks'
const DEFAULT_TAG = 'À trier'
const COVER_TONES = ['violet', 'coral', 'blue', 'green', 'cyan', 'mono'] as const

const seedBookmarks: Bookmark[] = [
  { id: 'react-dev', url: 'https://react.dev', domain: 'react.dev', name: 'React', tags: ['React'] },
  {
    id: 'nextjs-org',
    url: 'https://nextjs.org',
    domain: 'nextjs.org',
    name: 'Next.js',
    tags: ['Next.js'],
  },
  {
    id: 'motion-dev',
    url: 'https://motion.dev',
    domain: 'motion.dev',
    name: 'Motion',
    tags: ['Animation'],
  },
  {
    id: 'web-dev',
    url: 'https://web.dev',
    domain: 'web.dev',
    name: 'web.dev',
    tags: ['Performance'],
  },
  {
    id: 'tailwindcss-com',
    url: 'https://tailwindcss.com',
    domain: 'tailwindcss.com',
    name: 'Tailwind CSS',
    tags: ['CSS'],
  },
  {
    id: 'anthropic-com',
    url: 'https://www.anthropic.com',
    domain: 'anthropic.com',
    name: 'Anthropic',
    tags: ['IA'],
  },
]

function coverTone(domain: string) {
  let hash = 0
  for (const char of domain) hash = (hash * 31 + char.codePointAt(0)!) % 997
  return COVER_TONES[hash % COVER_TONES.length]
}

function parseBookmark(raw: string, activeTag: string): Bookmark | null {
  const candidate = raw.trim()
  if (!candidate) return null
  try {
    const url = new URL(candidate.includes('://') ? candidate : `https://${candidate}`)
    if (!url.hostname.includes('.')) return null
    const domain = url.hostname.replace(/^www\./, '')
    // Prefer the registrable name over a subdomain: developer.mozilla.org -> Mozilla.
    const parts = domain.split('.')
    const label = parts.length > 2 ? parts[parts.length - 2] : parts[0]
    return {
      id: `${domain}-${Date.now()}`,
      url: url.href,
      domain,
      name: label.charAt(0).toUpperCase() + label.slice(1),
      tags: [activeTag === 'Tous' ? DEFAULT_TAG : activeTag],
    }
  } catch {
    return null
  }
}

function WatchPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(seedBookmarks)
  const [hydrated, setHydrated] = useState(false)
  const [draft, setDraft] = useState('')
  const [activeTag, setActiveTag] = useState('Tous')
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setBookmarks(JSON.parse(saved) as Bookmark[])
    } catch {
      // Corrupted storage: keep the seeds.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
  }, [bookmarks, hydrated])

  const tags = useMemo(() => {
    const all = new Set<string>()
    for (const bookmark of bookmarks) for (const tag of bookmark.tags) all.add(tag)
    return ['Tous', ...[...all].sort((a, b) => a.localeCompare(b, 'fr'))]
  }, [bookmarks])

  const visibleBookmarks = useMemo(
    () =>
      activeTag === 'Tous'
        ? bookmarks
        : bookmarks.filter((bookmark) => bookmark.tags.includes(activeTag)),
    [bookmarks, activeTag]
  )

  function addBookmark(raw: string) {
    const bookmark = parseBookmark(raw, activeTag)
    if (!bookmark) {
      setError(true)
      return
    }
    setError(false)
    setDraft('')
    setBookmarks((current) => [bookmark, ...current])
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    addBookmark(draft)
  }

  function removeBookmark(id: string) {
    setBookmarks((current) => current.filter((bookmark) => bookmark.id !== id))
  }

  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">Veille active</p>
        <h1>Ma bibliothèque de liens, triée par tags.</h1>
        <p>
          Colle un lien, il devient une carte cliquable. Filtre par tag pour retrouver une référence
          en quelques secondes.
        </p>
      </header>
      <form className="search-bar veille-add-bar" onSubmit={submit}>
        <Link2 size={17} />
        <label className="sr-only" htmlFor="veille-url">
          Ajouter un lien
        </label>
        <input
          id="veille-url"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            setError(false)
          }}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData('text')
            if (parseBookmark(pasted, activeTag)) {
              event.preventDefault()
              addBookmark(pasted)
            }
          }}
          placeholder="Collez votre lien ici…"
          aria-invalid={error}
        />
        <button type="submit">
          <Plus size={14} /> Ajouter
        </button>
      </form>
      <AnimatePresence>
        {error ? (
          <m.p
            className="veille-error"
            role="alert"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
          >
            Ce lien ne ressemble pas à une URL valide.
          </m.p>
        ) : null}
      </AnimatePresence>
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
                <p>{bookmark.domain}</p>
                <h2>{bookmark.name}</h2>
                <span className="veille-tag-list">
                  {bookmark.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </span>
              </a>
              <button
                className="veille-remove"
                onClick={() => removeBookmark(bookmark.id)}
                type="button"
                aria-label={`Supprimer ${bookmark.name}`}
              >
                <X size={13} />
              </button>
            </m.article>
          ))}
        </AnimatePresence>
      </div>
      {visibleBookmarks.length === 0 ? (
        <p className="veille-empty">Aucun lien avec ce tag pour l’instant.</p>
      ) : null}
    </div>
  )
}

export { WatchPage as default }
