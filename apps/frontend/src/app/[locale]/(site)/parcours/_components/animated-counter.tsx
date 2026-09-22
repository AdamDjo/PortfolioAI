'use client'

import { animate, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { EASE_OUT_EXPO } from '@/components/motion/primitives'

interface AnimatedCounterProps {
  /** Display value, e.g. "12", "248", "12.4K", "+20%". */
  value: string
  duration?: number
  delay?: number
}

const NUMBER_PATTERN = /-?\d+(?:\.\d+)?/

export function AnimatedCounter({ value, duration = 1.4, delay = 0 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const match = NUMBER_PATTERN.exec(value)
    if (match?.index === undefined) return

    const target = Number.parseFloat(match[0])
    const decimals = match[0].includes('.') ? match[0].split('.')[1].length : 0
    const prefix = value.slice(0, match.index)
    const suffix = value.slice(match.index + match[0].length)

    if (!inView) {
      setDisplay(`${prefix}${(0).toFixed(decimals)}${suffix}`)
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setDisplay(value)
      return
    }

    const controls = animate(0, target, {
      duration,
      delay,
      ease: EASE_OUT_EXPO,
      onUpdate: (latest) => setDisplay(`${prefix}${latest.toFixed(decimals)}${suffix}`),
    })
    return () => controls.stop()
  }, [inView, value, duration, delay])

  return <span ref={ref}>{display}</span>
}
