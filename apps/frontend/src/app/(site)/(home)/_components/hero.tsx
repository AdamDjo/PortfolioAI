'use client'

import { ArrowRight, Send, Sparkles } from 'lucide-react'
import { AnimatePresence, m, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useImperativeHandle, useRef, useState, type FormEvent, type RefObject } from 'react'

import { HOME_CONTENT } from '@/app/(site)/(home)/_content'
import { AvailabilityBadge } from '@/components/motion/availability-badge'
import { EASE_OUT_QUINT, Stagger, StaggerItem } from '@/components/motion/primitives'

const { hero, chat } = HOME_CONTENT

export interface HeroChatHandle {
  /** Scrolls to the chat input and focuses it, prefilling it when given a question. */
  ask: (question?: string) => void
}

interface HeroProps {
  role: string
  location: string | null
  chatRef: RefObject<HeroChatHandle | null>
  onStartChat: () => void
}

export function Hero({ role, location, chatRef, onStartChat }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  useImperativeHandle(chatRef, () => ({
    ask(prefill) {
      if (prefill) setQuestion(prefill)
      const input = inputRef.current
      if (!input) return
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      input.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
      window.requestAnimationFrame(() => input.focus({ preventScroll: true }))
    },
  }))

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const brainY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const chatY = useTransform(scrollYProgress, [0, 1], [0, -36])
  const heroFade = useTransform(scrollYProgress, [0, 0.85], [1, 0.35])

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!question.trim()) return
    setAnswer(chat.cannedAnswer)
    setQuestion('')
  }

  return (
    <section className="hero shell" ref={heroRef}>
      <Stagger className="hero-copy" stagger={0.09} delay={0.1} onMount>
        <StaggerItem variant="rise-visible">
          <AvailabilityBadge>{hero.availability}</AvailabilityBadge>
        </StaggerItem>
        {/* Holds the LCP element: painted by the server with no entrance
            animation, so the heading is never gated on hydration. */}
        <h1 className="hero-title">
          <span className="mask-line">{hero.titleLeading}</span>
          <span className="mask-line">
            {hero.titleTrailing}
            <span className="gradient-text">{hero.titleAccent}</span>
          </span>
        </h1>
        <StaggerItem variant="rise-visible">
          <p className="hero-lead">
            {hero.lead[0]}
            <br />
            {hero.lead[1]}
          </p>
        </StaggerItem>
        <StaggerItem variant="rise-visible">
          <div className="hero-actions">
            <m.button
              className="button button-primary"
              onClick={onStartChat}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            >
              {hero.primaryAction} <ArrowRight size={16} />
            </m.button>
            <Link className="button button-secondary" href="/a-propos">
              {hero.secondaryAction}
            </Link>
          </div>
        </StaggerItem>
        <StaggerItem variant="rise-visible">
          <p className="hero-location">
            {role}
            {location ? ` · ${location}` : ''}
          </p>
        </StaggerItem>
      </Stagger>

      <m.div className="hero-visual" id="conversation" style={{ opacity: heroFade }}>
        {/* Candidate LCP element on slow CPUs: it must never start at
            opacity 0, or the paint waits for hydration. Scale and blur
            still carry the entrance. */}
        <m.div
          style={{ y: brainY }}
          initial={{ scale: 1.05, filter: 'blur(14px)' }}
          animate={{ scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.05, ease: EASE_OUT_QUINT }}
        >
          <m.div
            animate={{ y: [-7, 7, -7] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              className="brain brain-light"
              src="/images/hero-brain-light.webp"
              width={1080}
              height={720}
              decoding="async"
              unoptimized
              priority
              fetchPriority="high"
              alt="Cerveau 3D relié par un réseau neuronal"
            />
            <Image
              className="brain brain-dark"
              src="/images/hero-brain-dark.webp"
              width={1080}
              height={720}
              decoding="async"
              unoptimized
              priority
              fetchPriority="high"
              alt=""
              aria-hidden="true"
            />
          </m.div>
        </m.div>
        <m.div
          className="chat-card"
          style={{ y: chatY }}
          initial={{ opacity: 0, y: 46, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.22, duration: 0.7, delay: 0.15 }}
        >
          <div className="chat-header">
            <span>
              <Sparkles size={14} />
              {chat.header}
            </span>
            <small>{chat.status}</small>
          </div>
          <m.div
            className="message message-user"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.32, ease: EASE_OUT_QUINT }}
          >
            {chat.userMessage}
          </m.div>
          <m.div
            className="message-row"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            // Holds the LCP element: kept early so the paint is not animation-gated.
            transition={{ duration: 0.45, delay: 0.45, ease: EASE_OUT_QUINT }}
          >
            <span className="avatar">A</span>
            <div className="message message-ai">{chat.aiMessage}</div>
          </m.div>
          <AnimatePresence>
            {answer ? (
              <m.p
                className="chat-answer"
                role="status"
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT_QUINT }}
              >
                {answer}
              </m.p>
            ) : null}
          </AnimatePresence>
          <m.form
            className="chat-form"
            onSubmit={submitQuestion}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.58, ease: EASE_OUT_QUINT }}
          >
            <label className="sr-only" htmlFor="hero-question">
              {chat.inputLabel}
            </label>
            <input
              ref={inputRef}
              id="hero-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={chat.inputPlaceholder}
            />
            <button type="submit" aria-label={chat.submitLabel}>
              <Send size={15} />
            </button>
          </m.form>
        </m.div>
      </m.div>
    </section>
  )
}
