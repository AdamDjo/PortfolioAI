'use client'

import { useEffect } from 'react'

export function HomeMotion() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !('IntersectionObserver' in window)) return

    const animations: Animation[] = []
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const element = entry.target
          animations.push(
            element.animate(
              [
                { opacity: 0, transform: 'translateY(24px)' },
                { opacity: 1, transform: 'translateY(0)' },
              ],
              { duration: 560, easing: 'cubic-bezier(.22,1,.36,1)' }
            )
          )

          element.querySelectorAll<HTMLElement>('.project-card').forEach((card, index) => {
            animations.push(
              card.animate(
                [
                  { opacity: 0, transform: 'translateY(18px) scale(.98)' },
                  { opacity: 1, transform: 'translateY(0) scale(1)' },
                ],
                {
                  duration: 480,
                  delay: index * 70,
                  easing: 'cubic-bezier(.22,1,.36,1)',
                  fill: 'backwards',
                }
              )
            )
          })

          observer.unobserve(element)
        })
      },
      { rootMargin: '0px 0px -12% 0px' }
    )

    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
      observer.observe(element)
    })

    return () => {
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
    }
  }, [])

  return null
}
