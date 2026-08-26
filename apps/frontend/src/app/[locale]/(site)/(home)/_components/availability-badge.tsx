'use client'

import { m, useReducedMotion } from 'motion/react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

import type { ReactNode } from 'react'

interface AvailabilityBadgeProps {
  /**
   * Drives the colour token: green when open, red when closed. Both states
   * pulse — a still dot would read as "disabled" rather than as a status.
   */
  available: boolean
  children: ReactNode
}

export function AvailabilityBadge({ available, children }: AvailabilityBadgeProps) {
  const reduceMotion = useReducedMotion()
  const className = available ? 'availability' : 'availability availability-idle'

  if (reduceMotion) {
    return (
      <span className={className}>
        <span className="availability-dot">
          <span className="availability-core" />
        </span>
        {children}
      </span>
    )
  }

  return (
    <m.span
      className={className}
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
      {/* Decorative highlight, not a status signal: it draws the eye to an open
          slot, so it stays out of the unavailable state. */}
      {available ? (
        <m.span
          className="availability-sweep"
          aria-hidden="true"
          animate={{ x: ['-120%', '220%'] }}
          transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 3.4, ease: 'easeInOut' }}
        />
      ) : null}
    </m.span>
  )
}
