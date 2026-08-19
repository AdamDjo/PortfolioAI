'use client'

import { Tags as TagsIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { VEILLE_CONTENT } from '../_content'

import { TagSelector } from './tag-selector'

import type { TagView } from '@/lib/tags'

/**
 * Per-card tag editor, reserved for the signed-in owner.
 *
 * It sits outside the card's `<a>`: a button nested in a link is invalid markup
 * and every click would navigate away instead of opening the popover.
 *
 * Saving happens on each toggle rather than behind a confirm button — the
 * gesture is meant to be "click the tag, pick the right one, done".
 */
interface CardTagEditorProps {
  bookmarkId: string
  tags: TagView[]
  selectedIds: string[]
  onSaved: () => void
}

function CardTagEditor({ bookmarkId, tags, selectedIds, onSaved }: CardTagEditorProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)
  // Optimistic copy: the popover reflects the click immediately, while the server
  // list only catches up after `router.refresh()`.
  const [draftIds, setDraftIds] = useState(selectedIds)
  const containerRef = useRef<HTMLDivElement>(null)
  const { tagPicker } = VEILLE_CONTENT

  // The server list is authoritative once a refresh lands.
  useEffect(() => {
    setDraftIds(selectedIds)
  }, [selectedIds])

  // Escape and outside clicks close the popover — the usual way out of a layer
  // opened by mistake.
  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  async function toggleTag(id: string) {
    const next = draftIds.includes(id)
      ? draftIds.filter((entry) => entry !== id)
      : [...draftIds, id]

    const previous = draftIds
    setDraftIds(next)
    setSaving(true)
    setFailed(false)

    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tags: next.map(Number) }),
      })

      if (!response.ok) {
        // Roll back: leaving the optimistic state would claim a save that never happened.
        setDraftIds(previous)
        setFailed(true)
        return
      }

      onSaved()
    } catch {
      setDraftIds(previous)
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="veille-tag-editor" ref={containerRef}>
      <button
        className="veille-tag-editor-trigger"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={tagPicker.openLabel}
        title={tagPicker.openLabel}
      >
        <TagsIcon size={13} aria-hidden />
      </button>
      {open ? (
        <div className="veille-tag-editor-popover">
          <TagSelector
            tags={tags}
            selectedIds={draftIds}
            onToggle={toggleTag}
            disabled={saving}
            ariaLabel={tagPicker.cardLabel}
          />
          {failed ? (
            <p className="veille-tag-editor-error" role="alert">
              {tagPicker.saveFailed}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export { CardTagEditor }
