'use client'

import { LazyMotion, MotionConfig } from 'motion/react'

import type { ReactNode } from 'react'

// Loaded as its own chunk after hydration: importing `domMax` directly would
// pull the whole feature bundle into the initial payload and block the main
// thread before first interaction. `domMax` (not `domAnimation`) is required
// because the site uses shared `layoutId` transitions.
const loadFeatures = async () => (await import('motion/react')).domMax

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
