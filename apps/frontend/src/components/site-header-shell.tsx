'use client'

import { m } from 'motion/react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

import type { ReactNode } from 'react'

/**
 * Animates the header in on first paint.
 *
 * Only the `<header>` element itself needs to be a client component; its
 * contents are passed as children so they stay server-rendered.
 */
export function SiteHeaderShell({ children }: { children: ReactNode }) {
  return (
    <m.header
      className="site-header"
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE_OUT_QUINT }}
    >
      {children}
    </m.header>
  )
}
