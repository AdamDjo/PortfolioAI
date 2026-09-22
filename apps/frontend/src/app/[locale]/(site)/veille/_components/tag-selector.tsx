'use client'

import { Check, Loader2, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState, type FormEvent } from 'react'

import { toTagSlug } from '@/lib/tag-slug'

import type { TagView } from '@/lib/tags'

/**
 * Checkable list of the existing tags, with an inline field to add one.
 *
 * Shared by the composer and the per-card editor so both offer the same gesture.
 * It lists the whole vocabulary, not only the tags already in use: a tag created
 * here or in `/admin` has to be selectable, or it could never be attached.
 *
 * The list itself is controlled — the parent owns the selection. Only the draft
 * name of a new tag is local state, since nothing outside needs it.
 */
interface TagSelectorProps {
  tags: TagView[]
  selectedIds: string[]
  onToggle: (id: string) => void
  disabled?: boolean
  /** Labels the group for screen readers; the two callers give it different wording. */
  ariaLabel: string
  /**
   * Renders the creation field. Off by default so a caller has to opt in: the
   * API refuses the write without a session anyway, but there is no point
   * showing a control to a visitor who cannot use it.
   */
  canCreate?: boolean
  /**
   * Called with the tag that a creation resolved to, so the caller can select it
   * and refresh the server-rendered list.
   */
  onCreated?: (tag: TagView) => void
}

function TagSelector({
  tags,
  selectedIds,
  onToggle,
  disabled,
  ariaLabel,
  canCreate,
  onCreated,
}: TagSelectorProps) {
  const [draft, setDraft] = useState('')
  const [creating, setCreating] = useState(false)
  const [failed, setFailed] = useState(false)
  // The selector is rendered once per card plus once in the composer, so the
  // field needs an id of its own or every label would point at the first input.
  const fieldId = useId()
  const t = useTranslations('Veille')

  async function createTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (creating) return

    const name = draft.trim()
    if (name === '') return

    // Resolve against the vocabulary already loaded, using the very rule the
    // collection slugifies with: typing "react" when "React" exists selects the
    // existing tag instead of posting a name the unique index would reject.
    const slug = toTagSlug(name)
    const existing = tags.find((tag) => toTagSlug(tag.name) === slug)
    if (existing) {
      setDraft('')
      setFailed(false)
      if (!selectedIds.includes(existing.id)) onToggle(existing.id)
      return
    }

    // A name made only of punctuation or emoji slugifies to nothing, and an
    // empty slug would collide with any other such tag.
    if (slug === '') {
      setFailed(true)
      return
    }

    setCreating(true)
    setFailed(false)

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The Payload session travels by cookie: nothing to carry by hand.
        credentials: 'include',
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        setFailed(true)
        return
      }

      // Payload wraps a created document under `doc`.
      const { doc } = (await response.json()) as { doc: { id: number | string; name: string } }
      setDraft('')
      onCreated?.({ id: String(doc.id), name: doc.name })
    } catch {
      setFailed(true)
    } finally {
      setCreating(false)
    }
  }

  const busy = Boolean(disabled) || creating

  return (
    <div className="veille-tag-picker-shell">
      {tags.length === 0 ? (
        <p className="veille-tag-picker-empty">
          {canCreate ? t('tagPickerNoTagsOwner') : t('tagPickerNoTags')}
        </p>
      ) : (
        <div className="veille-tag-picker" role="group" aria-label={ariaLabel}>
          {tags.map((tag) => {
            const selected = selectedIds.includes(tag.id)

            return (
              <button
                className={selected ? 'is-selected' : undefined}
                key={tag.id}
                type="button"
                onClick={() => onToggle(tag.id)}
                disabled={busy}
                // The button carries the state itself: no separate checkbox to label.
                aria-pressed={selected}
              >
                {selected ? <Check size={12} aria-hidden /> : null}
                {tag.name}
              </button>
            )
          })}
        </div>
      )}
      {canCreate ? (
        <form className="veille-tag-create" onSubmit={createTag}>
          <label className="sr-only" htmlFor={fieldId}>
            {t('tagCreateLabel')}
          </label>
          <input
            id={fieldId}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              setFailed(false)
            }}
            placeholder={t('tagCreatePlaceholder')}
            autoComplete="off"
            maxLength={60}
            aria-invalid={failed}
            disabled={busy}
          />
          <button type="submit" disabled={busy || draft.trim() === ''}>
            {creating ? (
              <Loader2 className="veille-spinner" size={13} aria-hidden />
            ) : (
              <Plus size={13} aria-hidden />
            )}
            {t('tagCreateSubmit')}
          </button>
        </form>
      ) : null}
      {failed ? (
        <p className="veille-tag-create-error" role="alert">
          {t('tagCreateFailed')}
        </p>
      ) : null}
    </div>
  )
}

export { TagSelector }
