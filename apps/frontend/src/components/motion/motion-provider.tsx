'use client'

import { LazyMotion, MotionConfig } from 'motion/react'

import type { ReactNode } from 'react'

// Loaded as its own chunk after hydration: importing `domMax` directly would
// pull the whole feature bundle into the initial payload and block the main
// thread before first interaction. `domMax` (not `domAnimation`) is required
// because the site uses shared `layoutId` transitions.
//
// The import targets `./features`, not `motion/react`: a dynamic import of the
// module every component already imports statically cannot be split, which is
// how the features ended up in the initial bundle of every page anyway.
const loadFeatures = async () => (await import('./features')).default

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
