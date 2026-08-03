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
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'

import { HomeMotion } from '@/components/home-motion'
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

export function HomePage() {
  const darkMode = useDarkMode()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [feature, setFeature] = useState<FeatureId>('ia')
  const inputRef = useRef<HTMLInputElement>(null)

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
      <HomeMotion />
      <section className="hero shell">
        <div className="hero-copy">
          <span className="availability">
            <span />
            Disponible pour des opportunités
          </span>
          <h1>
            Discute avec
            <br />
            mon <span className="gradient-text">cerveau</span>
          </h1>
          <p className="hero-lead">
            Pose-moi n’importe quelle question.
            <br />
            Mon IA vous répond instantanément.
          </p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => focusChat()} type="button">
              Commencer à discuter <ArrowRight size={16} />
            </button>
            <Link className="button button-secondary" href="/a-propos">
              En savoir plus
            </Link>
          </div>
          <p className="hero-location">Frontend Engineer basé en France</p>
        </div>

        <div className="hero-visual" id="conversation">
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
          <div className="chat-card">
            <div className="chat-header">
              <span>
                <Sparkles size={14} />
                Conversation avec mon portfolio
              </span>
              <small>En ligne</small>
            </div>
            <div className="message message-user">Bonjour, qui es-tu ?</div>
            <div className="message-row">
              <span className="avatar">A</span>
              <div className="message message-ai">
                Salut, je suis Adem. Je conçois des expériences web modernes, rapides et accessibles
                avec React, Next.js et TypeScript.
              </div>
            </div>
            {answer ? (
              <p className="chat-answer" role="status">
                {answer}
              </p>
            ) : null}
            <form className="chat-form" onSubmit={submitQuestion}>
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
            </form>
          </div>
        </div>
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
          {feature === 'ia' ? (
            <div className="feature-panel feature-panel-ai" key="ia">
              <div>
                <p className="eyebrow">Une réponse, pas un formulaire</p>
                <h2>Explore mon travail en posant une vraie question.</h2>
                <p>
                  Le chat devient un point d’entrée rapide vers mes projets, mes compétences et ma
                  façon de travailler.
                </p>
              </div>
              <div className="prompt-list">
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
              </div>
            </div>
          ) : null}
          {feature === 'links' ? (
            <div className="feature-panel feature-panel-links" key="links">
              <div className="feature-panel-heading">
                <div>
                  <p className="eyebrow">Bibliothèque personnelle</p>
                  <h2>Les références que je garde sous la main.</h2>
                </div>
                <Link className="text-link" href="/liens">
                  Ouvrir la collection <ArrowRight size={15} />
                </Link>
              </div>
              <div className="link-preview-grid">
                {linkPreview.map((link) => (
                  <article key={link.name}>
                    <span className={`link-preview-cover preview-${link.tone}`}>
                      {link.name.slice(0, 1)}
                    </span>
                    <strong>{link.name}</strong>
                    <small>{link.category}</small>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
          {feature === 'admin' ? (
            <div className="feature-panel feature-panel-admin" key="admin">
              <div className="feature-panel-heading">
                <div>
                  <p className="eyebrow">Vue d’ensemble</p>
                  <h2>Un panneau simple pour piloter le contenu.</h2>
                </div>
                <Link className="text-link" href="/admin">
                  Voir le dashboard <ArrowRight size={15} />
                </Link>
              </div>
              <div className="dashboard-preview-grid">
                {dashboardPreview.map((metric) => (
                  <article key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <small>{metric.delta}</small>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="intro-projects shell" data-reveal>
        <article className="about-teaser">
          <p className="eyebrow">À propos de moi</p>
          <h2>Je transforme des idées en interfaces nettes.</h2>
          <p>
            J’aide les marques et les startups à créer des produits modernes, performants et centrés
            utilisateur.
          </p>
          <Link className="text-link" href="/a-propos">
            Découvrir mon parcours <ArrowRight size={15} />
          </Link>
        </article>
        <div className="projects-teaser">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Sélection</p>
              <h2>Mes derniers projets</h2>
            </div>
            <Link className="text-link" href="/projets">
              Voir tous <ArrowRight size={15} />
            </Link>
          </div>
          <div className="project-grid project-grid-home">
            {projects.map((project) => (
              <Link className="project-card" href={project.url} key={project.title}>
                <span className={`project-visual tone-${project.tone}`}>
                  <span>{project.title}</span>
                </span>
                <strong>{project.title}</strong>
                <small>{project.tags.join(' / ')}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="quality-strip">
        <div className="shell quality-grid">
          <span>
            <Gauge size={17} />
            Rapide
          </span>
          <span>
            <Smartphone size={17} />
            Responsive
          </span>
          <span>
            <ShieldCheck size={17} />
            Accessible
          </span>
          <span>
            <MessageSquare size={17} />
            SEO Friendly
          </span>
        </div>
      </section>
    </>
  )
}
