'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function HomeMotion() {
  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const activeBrain =
      document.documentElement.dataset.theme === 'dark' ? '.brain-dark' : '.brain-light'
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
    intro
      .from('.hero-copy > *', {
        opacity: 0,
        y: 18,
        duration: 0.65,
        stagger: 0.08,
        clearProps: 'opacity,transform',
      })
      .from(
        activeBrain,
        { opacity: 0, scale: 0.92, duration: 1.1, clearProps: 'opacity,transform' },
        0.1
      )
      .from(
        '.chat-card',
        { opacity: 0, y: 24, scale: 0.97, duration: 0.75, clearProps: 'opacity,transform' },
        0.28
      )

    const revealElements = gsap.utils.toArray<HTMLElement>('[data-reveal]')
    const revealTriggers = revealElements.map((element) =>
      ScrollTrigger.create({
        trigger: element,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            element,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: 'power3.out',
              clearProps: 'opacity,transform',
            }
          )
        },
      })
    )

    const projectCards = gsap.utils.toArray<HTMLElement>('.project-card')
    const projectTrigger =
      projectCards.length > 0
        ? ScrollTrigger.create({
            trigger: '.project-grid-home',
            start: 'top 88%',
            once: true,
            onEnter: () => {
              gsap.fromTo(
                projectCards,
                { opacity: 0, y: 24, scale: 0.97 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.65,
                  stagger: 0.09,
                  ease: 'power3.out',
                  clearProps: 'opacity,transform',
                }
              )
            },
          })
        : null

    const refreshScrollTriggers = () => ScrollTrigger.refresh()
    const refreshFrame = window.requestAnimationFrame(refreshScrollTriggers)
    if (document.readyState !== 'complete') {
      window.addEventListener('load', refreshScrollTriggers, { once: true })
    }

    return () => {
      window.cancelAnimationFrame(refreshFrame)
      window.removeEventListener('load', refreshScrollTriggers)
      revealTriggers.forEach((trigger) => trigger.kill())
      projectTrigger?.kill()
      intro.kill()
    }
  }, [])

  return null
}
