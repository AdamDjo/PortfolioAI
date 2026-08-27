'use client'

import { m } from 'motion/react'

import type { Variants } from 'motion/react'
import type { ReactNode } from 'react'

/*
 * Motion takes easing as control points, CSS as a `cubic-bezier()` string, so the
 * same curve has to exist in both forms. The CSS half lives in `globals.css` as
 * `--ease-out-expo` / `--ease-out-quint`; changing one means changing the other.
 */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const

const VIEWPORT = { once: true, margin: '0px 0px -14% 0px' } as const

export const staggerContainer = (stagger = 0.07, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

/**
 * Entrance for content revealed on scroll.
 *
 * `opacity` and `y` only: both run on the compositor. The blur this variant used
 * to carry could not — `filter` is repainted on the main thread every frame, and
 * with this variant applied to a few dozen elements the browser reported them all
 * as non-composited animations.
 */
export const riseItem: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_QUINT },
  },
}

/**
 * Entrance for content rendered above the fold. Only a transform — no opacity
 * fade, no blur: the server renders `hidden` inline, and an element that starts
 * at opacity 0 (or blurred) is not counted as painted until hydration runs,
 * which defers LCP on slow devices. A translate leaves the element fully painted
 * from the first frame, so Motion here only enriches an already-visible element.
 */
const riseItemVisible: Variants = {
  hidden: { y: 26 },
  visible: {
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_QUINT },
  },
}

const scaleItem: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT_QUINT },
  },
}

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
  /**
   * Animate on mount instead of on scroll into view.
   *
   * `VIEWPORT` trims 14% off the bottom of the viewport so the reveal fires just
   * before an element is reached. Content already inside the first screen never
   * crosses that reduced boundary, so it would hold its hidden state — and its
   * height — until the visitor scrolls.
   */
  onMount?: boolean
}

/** Compositor-only entrance, for the same reason as `riseItem`. */
export function Reveal({ children, className, delay = 0, y = 26, onMount }: RevealProps) {
  const visible = { opacity: 1, y: 0 }

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(onMount ? { animate: visible } : { whileInView: visible, viewport: VIEWPORT })}
      transition={{ duration: 0.75, delay, ease: EASE_OUT_QUINT }}
    >
      {children}
    </m.div>
  )
}

interface StaggerProps {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
  /** Animate on mount instead of on scroll into view. */
  onMount?: boolean
}

export function Stagger({ children, className, stagger = 0.07, delay = 0, onMount }: StaggerProps) {
  return (
    <m.div
      className={className}
      initial="hidden"
      {...(onMount ? { animate: 'visible' } : { whileInView: 'visible', viewport: VIEWPORT })}
      variants={staggerContainer(stagger, delay)}
    >
      {children}
    </m.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
  variant?: 'rise' | 'rise-visible' | 'scale'
}

const ITEM_VARIANTS: Record<NonNullable<StaggerItemProps['variant']>, Variants> = {
  rise: riseItem,
  'rise-visible': riseItemVisible,
  scale: scaleItem,
}

export function StaggerItem({ children, className, variant = 'rise' }: StaggerItemProps) {
  return (
    <m.div className={className} variants={ITEM_VARIANTS[variant]}>
      {children}
    </m.div>
  )
}
