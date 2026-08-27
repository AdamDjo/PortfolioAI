'use client'

import { m } from 'motion/react'
import { usePathname } from 'next/navigation'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

import type { ReactNode } from 'react'

/**
 * Route transition.
 *
 * The entrance animates `y` alone — never `opacity`, and no longer `filter`.
 *
 * `opacity` is excluded because the server renders this wrapper's `initial`
 * styles inline: fading in from 0 would hide the whole page — the LCP element
 * included — until hydration completes.
 *
 * `filter: blur()` is excluded for two reasons. It cannot run on the compositor,
 * so every frame of the transition repaints the entire page on the main thread,
 * exactly while React is hydrating. And it wraps the whole document — the hero
 * mascot with it — in a filtered stacking context, which delayed the browser's
 * final Largest Contentful Paint until the animation had finished. A translate
 * is composited and leaves the LCP element painted from the first frame.
 *
 * `key` on the pathname remounts the wrapper on every client navigation, so
 * each route still plays its own entrance.
 */
function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <m.div
      key={pathname}
      initial={{ y: 14 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.55, ease: EASE_OUT_QUINT }}
    >
      {children}
    </m.div>
  )
}

export { Template as default }
