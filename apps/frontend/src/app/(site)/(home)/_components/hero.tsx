'use client'

import { ArrowRight, Send, Sparkles } from 'lucide-react'
import { AnimatePresence, m, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react'

import { HOME_CONTENT } from '@/app/(site)/(home)/_content'
import { EASE_OUT_QUINT, Stagger, StaggerItem } from '@/components/motion/primitives'
import { useAssistant } from '@/hooks/use-assistant'

import { AvailabilityBadge } from './availability-badge'

import type { HomeAvailability } from './types'

const { hero, chat } = HOME_CONTENT

const FOLLOW_TAIL_THRESHOLD = 80

export interface HeroChatHandle {
  /** Scrolls to the chat input and focuses it, prefilling it when given a question. */
  ask: (question?: string) => void
}

interface HeroProps {
  role: string
  location: string | null
  availability: HomeAvailability
  chatRef: RefObject<HeroChatHandle | null>
  onStartChat: () => void
}

export function Hero({ role, location, availability, chatRef, onStartChat }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const [question, setQuestion] = useState('')
  const { turns, streaming, pending, error, ask } = useAssistant()

  // The scripted exchange is the empty state: it shows what the chat is for.
  // The moment a real question lands it steps aside for the conversation.
  const started = turns.length > 0

  // The transcript is bounded and scrollable, so new tokens would otherwise
  // stream in below the fold. Following the tail keeps the answer in view while
  // it is written, which is the only moment the visitor cares about.
  useEffect(() => {
    const thread = threadRef.current
    if (!thread) return

    // Someone who scrolled up is reading an earlier turn; yanking them back to
    // the bottom on every token would make that impossible.
    const distanceFromBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight
    if (distanceFromBottom > FOLLOW_TAIL_THRESHOLD) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    thread.scrollTo({ top: thread.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [turns, streaming, pending])

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
    if (!question.trim() || pending) return
    void ask(question)
    setQuestion('')
  }

  return (
    <section className="hero shell" ref={heroRef}>
      <Stagger className="hero-copy" stagger={0.09} delay={0.1} onMount>
        <StaggerItem variant="rise-visible">
          <AvailabilityBadge available={availability.available}>
            {availability.label}
          </AvailabilityBadge>
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
          {started ? null : (
            <>
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
            </>
          )}

          {/* The live conversation. `aria-live` is polite so a screen reader
              announces the finished answer without interrupting on every token. */}
          <div className="chat-thread" ref={threadRef} aria-live="polite" aria-busy={pending}>
            {turns.map((turn, index) =>
              turn.role === 'user' ? (
                <m.div
                  // Turns are append-only, so the index is a stable identity here.
                  key={`user-${index}`}
                  className="message message-user"
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE_OUT_QUINT }}
                >
                  {turn.content}
                </m.div>
              ) : (
                <m.div
                  key={`assistant-${index}`}
                  className="message-row"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT_QUINT }}
                >
                  <span className="avatar">A</span>
                  <div className="message message-ai">{turn.content}</div>
                </m.div>
              )
            )}

            {streaming ? (
              <div className="message-row">
                <span className="avatar">A</span>
                <div className="message message-ai">{streaming}</div>
              </div>
            ) : null}

            {/* Shown only before the first token: once text flows, it is the
                progress indicator. */}
            {pending && !streaming ? (
              <div className="message-row">
                <span className="avatar">A</span>
                <div className="message message-ai chat-typing" role="status">
                  <span />
                  <span />
                  <span />
                  <span className="sr-only">Réponse en cours</span>
                </div>
              </div>
            ) : null}
          </div>

          <AnimatePresence>
            {error ? (
              <m.p
                className="chat-error"
                role="alert"
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT_QUINT }}
              >
                {error}
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
            <button type="submit" aria-label={chat.submitLabel} disabled={pending}>
              <Send size={15} />
            </button>
          </m.form>
        </m.div>
      </m.div>
    </section>
  )
}
