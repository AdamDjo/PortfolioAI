'use client'

import { m } from 'motion/react'

import type { Variants } from 'motion/react'
import type { ReactNode } from 'react'


export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const

const VIEWPORT = { once: true, margin: '0px 0px -14% 0px' } as const

export const staggerContainer = (stagger = 0.07, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: EASE_OUT_QUINT },
  },
}

/**
 * Entrance for content rendered above the fold. Identical to `riseItem` but
 * without the opacity fade: the server renders `hidden` inline, so an element
 * starting at opacity 0 is not painted until hydration runs, which defers LCP
 * on slow devices. Motion here enriches an already-visible element.
 */
export const riseItemVisible: Variants = {
  hidden: { y: 26, filter: 'blur(6px)' },
  visible: {
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: EASE_OUT_QUINT },
  },
}

export const scaleItem: Variants = {
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
  blur?: boolean
  once?: boolean
}

export function Reveal({ children, className, delay = 0, y = 26, blur = true }: RevealProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? 'blur(6px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={VIEWPORT}
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

