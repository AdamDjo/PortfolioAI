'use client'

import { m, useReducedMotion } from 'motion/react'

const orbs = [
  { className: 'ambient-orb ambient-orb-a', x: [0, 60, -30, 0], y: [0, -40, 30, 0], duration: 26 },
  { className: 'ambient-orb ambient-orb-b', x: [0, -70, 25, 0], y: [0, 45, -35, 0], duration: 32 },
  { className: 'ambient-orb ambient-orb-c', x: [0, 45, -55, 0], y: [0, -30, 25, 0], duration: 29 },
]

export function AmbientField() {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <div className="ambient-field" aria-hidden="true">
        {orbs.map((orb) => (
          <span className={orb.className} key={orb.className} />
        ))}
        <span className="ambient-grid" />
      </div>
    )
  }

  return (
    <div className="ambient-field" aria-hidden="true">
      {orbs.map((orb) => (
        <m.span
          className={orb.className}
          key={orb.className}
          animate={{ x: orb.x, y: orb.y }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <m.span
        className="ambient-grid"
        animate={{ opacity: [0.2, 0.38, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
