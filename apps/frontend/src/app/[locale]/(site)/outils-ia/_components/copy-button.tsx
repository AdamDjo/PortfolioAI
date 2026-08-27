'use client'

import { Check, Copy, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

const FEEDBACK_MS = 1800

type CopyState = 'idle' | 'done' | 'failed'

const LABELS: Record<CopyState, 'copyIdle' | 'copyDone' | 'copyFailed'> = {
  idle: 'copyIdle',
  done: 'copyDone',
  failed: 'copyFailed',
}

/**
 * Copies a snippet to the clipboard and reports the outcome on the button.
 *
 * `navigator.clipboard` is undefined outside a secure context, and even when
 * present the write can be refused by the browser. Both paths land on the same
 * `failed` state, which is why the page also shows the snippet as selectable
 * text: the button is the shortcut, never the only way to get the value.
 */
function CopyButton({ value, label }: { value: string; label: string }) {
  const t = useTranslations('Tools')
  const [state, setState] = useState<CopyState>('idle')
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // A click landing right before unmount would otherwise set state on a gone
  // component, and a second click must restart the delay rather than stack one.
  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current)
    },
    []
  )

  const scheduleReset = () => {
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setState('idle'), FEEDBACK_MS)
  }

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable')
      await navigator.clipboard.writeText(value)
      setState('done')
    } catch {
      setState('failed')
    }
    scheduleReset()
  }

  const Icon = state === 'done' ? Check : state === 'failed' ? X : Copy

  return (
    <button
      aria-label={t('copyAriaLabel', { name: label })}
      className={state === 'idle' ? 'copy-button' : `copy-button is-${state}`}
      onClick={handleCopy}
      type="button"
    >
      <Icon aria-hidden="true" size={14} />
      <span>{t(LABELS[state])}</span>
      {/* Icon and colour carry the outcome visually; this announces it too. */}
      <span aria-live="polite" className="sr-only">
        {state === 'failed' ? t('copyUnavailable') : state === 'done' ? t('copyDone') : ''}
      </span>
    </button>
  )
}

export { CopyButton }
