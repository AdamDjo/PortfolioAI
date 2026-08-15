'use client'

import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

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
  const rotateX = useSpring(
    useTransform(pointerY, [0, 1], [max, -max]),
    spring
  )
  const rotateY = useSpring(
    useTransform(pointerX, [0, 1], [-max, max]),
    spring
  )

  function track(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - bounds.left) / bounds.width)
    pointerY.set((event.clientY - bounds.top) / bounds.height)
  }

  function reset() {
    pointerX.set(0.5)
    pointerY.set(0.5)
  }

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <m.div
      className={className}
      onPointerMove={track}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }}
    >
      {children}
    </m.div>
  )
}
