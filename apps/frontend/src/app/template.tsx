'use client'

import { m } from 'motion/react'
import { usePathname } from 'next/navigation'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

import type { ReactNode } from 'react'

/**
 * Route transition.
 *
 * The entrance animates `y`, `blur` and `scale` but never `opacity`: the
 * server renders this wrapper's `initial` styles inline, so fading in from 0
 * would hide the whole page — the LCP element included — until hydration
 * completes. Keeping it opaque means the paint happens on the server HTML and
 * the transition only enriches something already visible.
 *
 * `key` on the pathname remounts the wrapper on every client navigation, so
 * each route still plays its own entrance.
 */
function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <m.div
      key={pathname}
      initial={{ y: 14, filter: 'blur(8px)' }}
      animate={{ y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.55, ease: EASE_OUT_QUINT }}
    >
      {children}
    </m.div>
  )
}

export { Template as default }
