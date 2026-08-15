'use client'

import { m, useReducedMotion } from 'motion/react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

import type { ReactNode } from 'react'

export function AvailabilityBadge({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <span className="availability">
        <span className="availability-dot">
          <span className="availability-core" />
        </span>
        {children}
      </span>
    )
  }

  return (
    <m.span
      className="availability"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.35, ease: EASE_OUT_QUINT }}
    >
      <span className="availability-dot">
        <m.span
          className="availability-ping"
          animate={{ scale: [1, 2.6], opacity: [0.55, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
        <m.span
          className="availability-core"
          animate={{ opacity: [1, 0.55, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </span>
      {children}
      <m.span
        className="availability-sweep"
        aria-hidden="true"
        animate={{ x: ['-120%', '220%'] }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 3.4, ease: 'easeInOut' }}
      />
    </m.span>
  )
}
