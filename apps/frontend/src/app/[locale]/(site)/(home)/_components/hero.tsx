'use client'

import {
  ArrowRight,
  GitBranchPlus,
  MapPin,
  MessageCircle,
  Rocket,
  Send,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react'

import { EASE_OUT_QUINT, Stagger, StaggerItem } from '@/components/motion/primitives'
import { TechnologyIcon } from '@/components/technology-icon'
import { useAssistant } from '@/hooks/use-assistant'
import { Link } from '@/i18n/navigation'

import { AvailabilityBadge } from './availability-badge'

import type { HomeAvailability } from './types'

const FOLLOW_TAIL_THRESHOLD = 80

// Product names, identical in every language: they belong in code, not in a
// translation catalogue where each locale would repeat them verbatim.
const SKILL_FALLBACK = ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js']
export interface HeroChatHandle {
  ask: (question?: string) => void
}

interface HeroProps {
  name: string
  role: string
  location: string | null
  yearsOfExperience: number | null
  projectCount: number
  skills: string[]
  availability: HomeAvailability
  retentionNotice: string
  chatRef: RefObject<HeroChatHandle | null>
}

export function Hero({
  name,
  role,
  location,
  yearsOfExperience,
  projectCount,
  skills,
  availability,
  retentionNotice,
  chatRef,
}: HeroProps) {
  const t = useTranslations('Home')
  const inputRef = useRef<HTMLInputElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const [question, setQuestion] = useState('')
  const { turns, streaming, pending, error, feedback, ask, rate } = useAssistant()
  const started = turns.length > 0
  // Feedback is offered once the assistant has answered and nothing is streaming:
  // rating an answer still being written makes no sense.
  const canRate = turns.some((turn) => turn.role === 'assistant') && !pending && !streaming
  const shownSkills = (skills.length > 0 ? skills : [...SKILL_FALLBACK]).slice(0, 5)

  useEffect(() => {
    const thread = threadRef.current
    if (!thread) return

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

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!question.trim() || pending) return
    void ask(question)
    setQuestion('')
  }

  return (
    <section className="home-hero shell" aria-labelledby="home-title">
      <Stagger className="home-hero-copy" stagger={0.08} delay={0.08} onMount>
        <StaggerItem variant="rise-visible">
          <AvailabilityBadge available={availability.available}>
            {availability.label}
          </AvailabilityBadge>
        </StaggerItem>

        <h1 className="home-hero-title" id="home-title">
          <span>{t('hero.titleLine1')}</span>
          <span>{t('hero.titleLine2')}</span>
          <span className="gradient-text">{t('hero.titleLine3')}</span>
        </h1>

        <StaggerItem variant="rise-visible">
          <p className="home-hero-lead">{t('hero.lead')}</p>
        </StaggerItem>

        <StaggerItem variant="rise-visible">
          <div className="home-hero-actions">
            <Link className="button button-primary" href="/projets">
              {t('hero.primaryAction')} <ArrowRight size={16} />
            </Link>
            <Link className="button button-secondary" href="/contact">
              {t('hero.secondaryAction')}
            </Link>
          </div>
        </StaggerItem>

        <StaggerItem variant="rise-visible">
          <ul className="home-tech-list" aria-label="Technologies principales">
            {shownSkills.slice(0, 4).map((skill) => (
              <li key={skill}>
                <TechnologyIcon name={skill} size={15} />
                {skill}
              </li>
            ))}
          </ul>
        </StaggerItem>

        {location ? (
          <StaggerItem variant="rise-visible">
            <p className="home-hero-location">
              <MapPin size={14} aria-hidden="true" /> {location}
            </p>
          </StaggerItem>
        ) : null}
      </Stagger>

      {/*
        The mascot is the hero's LCP element, so its entrance is CSS, not Framer
        Motion: a JS-driven fade kept the image at opacity 0 until hydration,
        pushing LCP past 4s. The CSS animation only moves it (opacity stays 1),
        so the browser paints it on the first frame. See home-mascot in _styles.
      */}
      <div className="home-mascot">
        <span className="home-mascot-doodle doodle-chat" aria-hidden="true">
          <MessageCircle size={28} />
        </span>
        <span className="home-mascot-doodle doodle-spark" aria-hidden="true">
          <Sparkles size={24} />
        </span>
        <Image
          src="/images/adem-mascot.webp"
          alt="Mascotte illustrée d’Adem tenant une tablette"
          width={1024}
          height={1536}
          sizes="(max-width: 760px) 70vw, 300px"
          priority
        />
      </div>

      <aside className="home-hero-aside" aria-label="Profil, compétences et assistant">
        <div className="home-mini-grid">
          <article className="home-profile-card">
            <h2>{t('profile.heading')}</h2>
            <span className="home-profile-avatar" aria-hidden="true">
              {name.slice(0, 1).toUpperCase()}
              <i />
            </span>
            <strong>{name}</strong>
            <small>{role}</small>
            {location ? <small>{location}</small> : null}
            <Link href="/a-propos">
              {t('profile.action')} <ArrowRight size={14} />
            </Link>
          </article>

          <article className="home-skills-card">
            <h2>{t('skills.heading')}</h2>
            <ul>
              {shownSkills.map((skill) => (
                <li key={skill}>
                  <TechnologyIcon name={skill} size={15} /> {skill}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <m.div
          className="home-chat-card"
          id="conversation"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.22, ease: EASE_OUT_QUINT }}
        >
          <div className="chat-header">
            <span>{t('chat.header')}</span>
            <small>{t('chat.status')}</small>
          </div>

          {started ? null : (
            <div className="home-chat-intro">
              <strong>{t('chat.userMessage')}</strong>
              <span>{t('chat.aiMessage')}</span>
            </div>
          )}

          <div className="chat-thread" ref={threadRef} aria-live="polite" aria-busy={pending}>
            {turns.map((turn, index) =>
              turn.role === 'user' ? (
                <m.div
                  key={`user-${index}`}
                  className="message message-user"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {turn.content}
                </m.div>
              ) : (
                <m.div
                  key={`assistant-${index}`}
                  className="message-row"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
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

            {pending && !streaming ? (
              <div className="message-row">
                <span className="avatar">A</span>
                <div className="message message-ai chat-typing" role="status">
                  <span />
                  <span />
                  <span />
                  <span className="sr-only">{t('chat.typing')}</span>
                </div>
              </div>
            ) : null}
          </div>

          {canRate ? (
            <div className="chat-feedback">
              {feedback ? (
                <span className="chat-feedback-thanks" role="status">
                  {t('chat.feedbackThanks')}
                </span>
              ) : (
                <>
                  <span>{t('chat.feedbackPrompt')}</span>
                  <button
                    type="button"
                    aria-label={t('chat.feedbackUseful')}
                    onClick={() => rate('useful')}
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={t('chat.feedbackNotUseful')}
                    onClick={() => rate('not_useful')}
                  >
                    <ThumbsDown size={14} />
                  </button>
                </>
              )}
            </div>
          ) : null}

          <AnimatePresence>
            {error ? (
              <m.p
                className="chat-error"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error}
              </m.p>
            ) : null}
          </AnimatePresence>

          <form className="chat-form" onSubmit={submitQuestion}>
            <label className="sr-only" htmlFor="hero-question">
              {t('chat.inputLabel')}
            </label>
            <input
              ref={inputRef}
              id="hero-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={t('chat.inputPlaceholder')}
            />
            <button type="submit" aria-label={t('chat.submitLabel')} disabled={pending}>
              <Send size={15} />
            </button>
          </form>

          <p className="chat-retention">
            {retentionNotice} <Link href="/confidentialite">{t('chat.privacyLink')}</Link>
          </p>
        </m.div>
      </aside>

      <Stagger className="home-stats" stagger={0.07} delay={0.35} onMount>
        <StaggerItem>
          <Rocket size={25} aria-hidden="true" />
          <span>
            <strong>+{projectCount}</strong>
            <small>{t('stats.projects', { count: projectCount })}</small>
          </span>
        </StaggerItem>
        <StaggerItem>
          <GitBranchPlus size={25} aria-hidden="true" />
          <span>
            <strong>{yearsOfExperience ?? 2}+</strong>
            <small>{t('stats.experience', { count: yearsOfExperience ?? 2 })}</small>
          </span>
        </StaggerItem>
        <StaggerItem>
          <Star size={25} aria-hidden="true" />
          <span>
            <strong>100%</strong>
            <small>{t('stats.satisfaction')}</small>
          </span>
        </StaggerItem>
      </Stagger>
    </section>
  )
}
