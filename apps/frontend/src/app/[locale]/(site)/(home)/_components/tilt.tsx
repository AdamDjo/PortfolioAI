'use client'

import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'

import type { PointerEvent, ReactNode } from 'react'

interface TiltProps {
  children: ReactNode
  className?: string
  /** Max rotation in degrees. */
  max?: number
}

/** Pointer-tracking 3D tilt with spring physics. */
export function Tilt({ children, className, max = 5 }: TiltProps) {
  const reduceMotion = useReducedMotion()
  const pointerX = useMotionValue(0.5)
  const pointerY = useMotionValue(0.5)
  const spring = { stiffness: 260, damping: 22, mass: 0.6 }
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [max, -max]), spring)
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-max, max]), spring)
  // Measured once when the pointer arrives, not on every move: the card is being
  // rotated by the spring while the pointer travels over it, so each
  // `getBoundingClientRect` in the move handler forced the browser to flush
  // layout mid-animation — dozens of synchronous reflows per second of hover.
  const boundsRef = useRef<DOMRect | null>(null)

  function measure(event: PointerEvent<HTMLDivElement>) {
    boundsRef.current = event.currentTarget.getBoundingClientRect()
  }

  function track(event: PointerEvent<HTMLDivElement>) {
    const bounds = boundsRef.current
    if (!bounds) return
    pointerX.set((event.clientX - bounds.left) / bounds.width)
    pointerY.set((event.clientY - bounds.top) / bounds.height)
  }

  function reset() {
    boundsRef.current = null
    pointerX.set(0.5)
    pointerY.set(0.5)
  }

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <m.div
      className={className}
      onPointerEnter={measure}
      onPointerMove={track}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }}
    >
      {children}
    </m.div>
  )
}
