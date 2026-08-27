'use client'

import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { TagView } from '@/lib/tags'

/**
 * Checkable list of the existing tags.
 *
 * Shared by the composer and the per-card editor so both offer the same gesture.
 * It lists the whole vocabulary, not only the tags already in use: a tag created
 * in `/admin` has to be selectable, or it could never be attached to anything.
 *
 * Purely controlled — it holds no state and cannot create a tag. Creation stays
 * in `/admin`, which is what keeps near-duplicates from piling up.
 */
interface TagSelectorProps {
  tags: TagView[]
  selectedIds: string[]
  onToggle: (id: string) => void
  disabled?: boolean
  /** Labels the group for screen readers; the two callers give it different wording. */
  ariaLabel: string
}

function TagSelector({ tags, selectedIds, onToggle, disabled, ariaLabel }: TagSelectorProps) {
  const t = useTranslations('Veille')

  if (tags.length === 0) {
    return <p className="veille-tag-picker-empty">{t('tagPickerNoTags')}</p>
  }

  return (
    <div className="veille-tag-picker" role="group" aria-label={ariaLabel}>
      {tags.map((tag) => {
        const selected = selectedIds.includes(tag.id)

        return (
          <button
            className={selected ? 'is-selected' : undefined}
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.id)}
            disabled={disabled}
            // The button carries the state itself: no separate checkbox to label.
            aria-pressed={selected}
          >
            {selected ? <Check size={12} aria-hidden /> : null}
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}

export { TagSelector }
