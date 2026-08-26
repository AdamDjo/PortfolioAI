'use client'

import { Link2, Loader2, Plus } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

import { useLocale } from '@/components/i18n/locale-context'
import { EASE_OUT_QUINT } from '@/components/motion/primitives'
import { canonicalizeUrl } from '@/lib/canonical-url'

import { getVeilleContent } from '../_content'

import { TagSelector } from './tag-selector'

import type { TagView } from '@/lib/tags'

/**
 * Add form reserved for the signed-in admin.
 *
 * It is only rendered when the Payload session is valid, and the API refuses the
 * write without a session anyway: the visual check is a convenience, not the
 * security barrier.
 *
 * Having it here rather than in `/admin` is about the gesture on a phone: pasting
 * a link from the public page, without a detour through the admin.
 */
interface BookmarkComposerProps {
  tags: TagView[]
}

function BookmarkComposer({ tags }: BookmarkComposerProps) {
  const router = useRouter()
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  // Deliberately kept across submissions: filing veille usually means adding
  // several links under the same tag, and re-checking it every time would grate.
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const { composer, tagPicker } = getVeilleContent(useLocale())

  async function addBookmark(raw: string) {
    const url = canonicalizeUrl(raw)
    if (!url) {
      setMessage(composer.invalidUrl)
      return
    }

    setStatus('saving')
    setMessage(null)

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The Payload session travels by cookie: nothing to carry by hand.
        credentials: 'include',
        // Payload expects relation identifiers; an empty list is valid and
        // creates an untagged link, exactly as before.
        body: JSON.stringify({ url, tags: selectedTagIds.map(Number) }),
      })

      if (response.status === 403 || response.status === 401) {
        setMessage(composer.sessionExpired)
        return
      }

      if (!response.ok) {
        // The most frequent case is the uniqueness violation on the URL.
        setMessage(composer.saveFailed)
        return
      }

      setDraft('')
      // The list is rendered server-side: ask for a re-render rather than
      // duplicating the collection state in the browser.
      router.refresh()
    } catch {
      setMessage(composer.networkError)
    } finally {
      setStatus('idle')
    }
  }

  function toggleTag(id: string) {
    setSelectedTagIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    )
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'saving') return
    void addBookmark(draft)
  }

  const saving = status === 'saving'

  return (
    <>
      <form className="search-bar veille-add-bar" onSubmit={submit}>
        <Link2 size={17} />
        <label className="sr-only" htmlFor="veille-url">
          {composer.inputLabel}
        </label>
        <input
          id="veille-url"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            setMessage(null)
          }}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData('text')
            if (canonicalizeUrl(pasted)) {
              event.preventDefault()
              setDraft(pasted)
              void addBookmark(pasted)
            }
          }}
          placeholder={composer.placeholder}
          inputMode="url"
          autoComplete="off"
          aria-invalid={message !== null}
          disabled={saving}
        />
        <button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="veille-spinner" size={14} /> {composer.submitSaving}
            </>
          ) : (
            <>
              <Plus size={14} /> {composer.submitIdle}
            </>
          )}
        </button>
      </form>
      {/*
        Below the bar rather than inside it: selecting a tag stays optional and
        must never stand between pasting a URL and it being saved.
      */}
      <TagSelector
        tags={tags}
        selectedIds={selectedTagIds}
        onToggle={toggleTag}
        disabled={saving}
        ariaLabel={tagPicker.composerLabel}
      />
      <AnimatePresence>
        {message ? (
          <m.p
            className="veille-error"
            role="alert"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
          >
            {message}
          </m.p>
        ) : null}
      </AnimatePresence>
    </>
  )
}

export { BookmarkComposer }
