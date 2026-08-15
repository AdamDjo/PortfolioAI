'use client'

import {
  ArrowRight,
  Bot,
  Gauge,
  LayoutDashboard,
  Link2,
  MessageSquare,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { AnimatePresence, m, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'

import { AnimatedCounter } from '@/components/motion/animated-counter'
import { AvailabilityBadge } from '@/components/motion/availability-badge'
import {
  EASE_OUT_QUINT,
  Reveal,
  Stagger,
  StaggerItem,
  riseItem,
  staggerContainer,
} from '@/components/motion/primitives'
import { Tilt } from '@/components/motion/tilt'
import { useDarkMode } from '@/components/site-shell'
import { projects } from '@/data/portfolio'

const features = [
  { id: 'ia', label: 'IA Conversationnelle', icon: Bot },
  { id: 'links', label: 'Collection de liens', icon: Link2 },
  { id: 'admin', label: 'Admin Dashboard', icon: LayoutDashboard },
] as const

type FeatureId = (typeof features)[number]['id']

const linkPreview = [
  { name: 'Awwwards', category: 'Inspiration', tone: 'lime' },
  { name: 'Tailwind CSS', category: 'Outils Dev', tone: 'cyan' },
  { name: 'Vercel', category: 'Outils Dev', tone: 'mono' },
]

const dashboardPreview = [
  { label: 'Projets', value: '12', delta: '+20%' },
  { label: 'Liens', value: '248', delta: '+15%' },
  { label: 'Vues', value: '12.4K', delta: '+8%' },
  { label: 'Messages', value: '32', delta: '+12%' },
]

const qualityItems = [
  { label: 'Rapide', icon: Gauge },
  { label: 'Responsive', icon: Smartphone },
  { label: 'Accessible', icon: ShieldCheck },
  { label: 'SEO Friendly', icon: MessageSquare },
]

export function HomePage() {
  const darkMode = useDarkMode()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [feature, setFeature] = useState<FeatureId>('ia')
  const inputRef = useRef<HTMLInputElement>(null)
  const heroRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const brainY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const chatY = useTransform(scrollYProgress, [0, 1], [0, -36])
  const heroFade = useTransform(scrollYProgress, [0, 0.85], [1, 0.35])

  function focusChat(prompt?: string) {
    if (prompt) setQuestion(prompt)
    setFeature('ia')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    inputRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    })
    window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }))
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!question.trim()) return
    setAnswer(
      'Je peux te parler de mes projets, de mon approche frontend ou de la façon dont j’utilise Next.js.'
    )
    setQuestion('')
  }

  return (
    <>
      <section className="hero shell" ref={heroRef}>
        <Stagger className="hero-copy" stagger={0.09} delay={0.1} onMount>
          <StaggerItem variant="rise-visible">
            <AvailabilityBadge>Disponible pour des opportunités</AvailabilityBadge>
          </StaggerItem>
          {/* Holds the LCP element: painted by the server with no entrance
              animation, so the heading is never gated on hydration. */}
          <h1 className="hero-title">
            <span className="mask-line">Discute avec</span>
            <span className="mask-line">
              mon <span className="gradient-text">cerveau</span>
            </span>
          </h1>
          <StaggerItem variant="rise-visible">
            <p className="hero-lead">
              Pose-moi n’importe quelle question.
              <br />
              Mon IA vous répond instantanément.
            </p>
          </StaggerItem>
          <StaggerItem variant="rise-visible">
            <div className="hero-actions">
              <m.button
                className="button button-primary"
                onClick={() => focusChat()}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
              >
                Commencer à discuter <ArrowRight size={16} />
              </m.button>
              <Link className="button button-secondary" href="/a-propos">
                En savoir plus
              </Link>
            </div>
          </StaggerItem>
          <StaggerItem variant="rise-visible">
            <p className="hero-location">Frontend Engineer basé en France</p>
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
                className="brain"
                src={darkMode ? '/images/hero-brain-dark.webp' : '/images/hero-brain-light.webp'}
                width={1080}
                height={720}
                decoding="async"
                unoptimized
                priority
                fetchPriority="high"
                alt="Cerveau 3D relié par un réseau neuronal"
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
                Conversation avec mon portfolio
              </span>
              <small>En ligne</small>
            </div>
            <m.div
              className="message message-user"
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.32, ease: EASE_OUT_QUINT }}
            >
              Bonjour, qui es-tu ?
            </m.div>
            <m.div
              className="message-row"
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              // Holds the LCP element: kept early so the paint is not animation-gated.
              transition={{ duration: 0.45, delay: 0.45, ease: EASE_OUT_QUINT }}
            >
              <span className="avatar">A</span>
              <div className="message message-ai">
                Salut, je suis Adem. Je conçois des expériences web modernes, rapides et accessibles
                avec React, Next.js et TypeScript.
              </div>
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
                Posez votre question
              </label>
              <input
                ref={inputRef}
                id="hero-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Posez votre question…"
              />
              <button type="submit" aria-label="Envoyer">
                <Send size={15} />
              </button>
            </m.form>
          </m.div>
        </m.div>
      </section>

      <section className="feature-switcher" aria-labelledby="feature-title">
        <div className="feature-heading shell">
          <span />
          <p id="feature-title">Découvrez mes fonctionnalités</p>
          <span />
        </div>
        <div className="feature-tabs shell" role="tablist">
          {features.map((item) => {
            const Icon = item.icon
            return (
              <button
                id={`feature-tab-${item.id}`}
                key={item.id}
                className={feature === item.id ? 'feature-tab is-active' : 'feature-tab'}
                onClick={() => setFeature(item.id)}
                type="button"
                role="tab"
                aria-controls="feature-panel"
                aria-selected={feature === item.id}
              >
                <span className="feature-icon">
                  <Icon size={18} />
                </span>
                {item.label}
                {feature === item.id ? (
                  <m.span
                    className="feature-underline"
                    layoutId="feature-underline"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.55 }}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            )
          })}
        </div>
        <div
          className="feature-stage shell"
          id="feature-panel"
          role="tabpanel"
          aria-labelledby={`feature-tab-${feature}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {feature === 'ia' ? (
              <m.div
                className="feature-panel feature-panel-ai"
                key="ia"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
                variants={staggerContainer(0.08)}
              >
                <m.div variants={riseItem}>
                  <p className="eyebrow">Une réponse, pas un formulaire</p>
                  <h2>Explore mon travail en posant une vraie question.</h2>
                  <p>
                    Le chat devient un point d’entrée rapide vers mes projets, mes compétences et ma
                    façon de travailler.
                  </p>
                </m.div>
                <m.div className="prompt-list" variants={riseItem}>
                  <button
                    type="button"
                    onClick={() => focusChat('Quel projet montre le mieux ton niveau en Next.js ?')}
                  >
                    Mon meilleur projet Next.js <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => focusChat('Comment travailles-tu avec une équipe produit ?')}
                  >
                    Ma façon de collaborer <ArrowRight size={15} />
                  </button>
                </m.div>
              </m.div>
            ) : null}
            {feature === 'links' ? (
              <m.div
                className="feature-panel feature-panel-links"
                key="links"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
                variants={staggerContainer(0.07)}
              >
                <m.div className="feature-panel-heading" variants={riseItem}>
                  <div>
                    <p className="eyebrow">Bibliothèque personnelle</p>
                    <h2>Les références que je garde sous la main.</h2>
                  </div>
                  <Link className="text-link" href="/liens">
                    Ouvrir la collection <ArrowRight size={15} />
                  </Link>
                </m.div>
                <div className="link-preview-grid">
                  {linkPreview.map((link) => (
                    <m.article key={link.name} variants={riseItem}>
                      <span className={`link-preview-cover preview-${link.tone}`}>
                        {link.name.slice(0, 1)}
                      </span>
                      <strong>{link.name}</strong>
                      <small>{link.category}</small>
                    </m.article>
                  ))}
                </div>
              </m.div>
            ) : null}
            {feature === 'admin' ? (
              <m.div
                className="feature-panel feature-panel-admin"
                key="admin"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
                variants={staggerContainer(0.07)}
              >
                <m.div className="feature-panel-heading" variants={riseItem}>
                  <div>
                    <p className="eyebrow">Vue d’ensemble</p>
                    <h2>Un panneau simple pour piloter le contenu.</h2>
                  </div>
                  <Link className="text-link" href="/admin">
                    Voir le dashboard <ArrowRight size={15} />
                  </Link>
                </m.div>
                <div className="dashboard-preview-grid">
                  {dashboardPreview.map((metric, index) => (
                    <m.article key={metric.label} variants={riseItem}>
                      <span>{metric.label}</span>
                      <strong>
                        <AnimatedCounter value={metric.value} delay={index * 0.08} />
                      </strong>
                      <small>{metric.delta}</small>
                    </m.article>
                  ))}
                </div>
              </m.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <section className="intro-projects shell">
        <Reveal className="about-teaser-reveal">
          <article className="about-teaser">
            <p className="eyebrow">À propos de moi</p>
            <h2>Je transforme des idées en interfaces nettes.</h2>
            <p>
              J’aide les marques et les startups à créer des produits modernes, performants et
              centrés utilisateur.
            </p>
            <Link className="text-link" href="/a-propos">
              Découvrir mon parcours <ArrowRight size={15} />
            </Link>
          </article>
        </Reveal>
        <div className="projects-teaser">
          <Reveal>
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Sélection</p>
                <h2>Mes derniers projets</h2>
              </div>
              <Link className="text-link" href="/projets">
                Voir tous <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <Stagger className="project-grid project-grid-home" stagger={0.09}>
            {projects.map((project) => (
              <StaggerItem key={project.title} variant="scale" className="card-fill">
                <Tilt max={6} className="card-fill">
                  <Link className="project-card" href={project.url}>
                    <span className={`project-visual tone-${project.tone}`}>
                      <span>{project.title}</span>
                    </span>
                    <strong>{project.title}</strong>
                    <small>{project.tags.join(' / ')}</small>
                  </Link>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="quality-strip">
        <Stagger className="shell quality-grid" stagger={0.08}>
          {qualityItems.map((item) => {
            const Icon = item.icon
            return (
              <StaggerItem key={item.label}>
                <span>
                  <Icon size={17} />
                  {item.label}
                </span>
              </StaggerItem>
            )
          })}
        </Stagger>
      </section>
    </>
  )
}
