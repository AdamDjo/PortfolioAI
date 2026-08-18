'use client'

import { ArrowRight, Bot, Link2, PenLine } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'

import { HOME_CONTENT } from '@/app/(site)/(home)/_content'
import { riseItem, staggerContainer } from '@/components/motion/primitives'

import type { HomeBookmark } from './types'

const { features } = HOME_CONTENT

const tabs = [
  { id: 'ia', label: 'IA Conversationnelle', icon: Bot },
  { id: 'links', label: 'Collection de liens', icon: Link2 },
  { id: 'admin', label: 'Contenu éditorial', icon: PenLine },
] as const

type FeatureId = (typeof tabs)[number]['id']

interface FeatureSwitcherProps {
  bookmarks: HomeBookmark[]
  /** Prefills the hero chat with a suggested question and scrolls to it. */
  onAskQuestion: (question: string) => void
}

export function FeatureSwitcher({ bookmarks, onAskQuestion }: FeatureSwitcherProps) {
  const [feature, setFeature] = useState<FeatureId>('ia')

  return (
    <section className="feature-switcher" aria-labelledby="feature-title">
      <div className="feature-heading shell">
        <span />
        <p id="feature-title">{features.heading}</p>
        <span />
      </div>
      <div className="feature-tabs shell" role="tablist">
        {tabs.map((item) => {
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
                <p className="eyebrow">{features.ai.eyebrow}</p>
                <h2>{features.ai.heading}</h2>
                <p>{features.ai.body}</p>
              </m.div>
              <m.div className="prompt-list" variants={riseItem}>
                {features.ai.prompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    type="button"
                    onClick={() => onAskQuestion(prompt.question)}
                  >
                    {prompt.label} <ArrowRight size={15} />
                  </button>
                ))}
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
                  <p className="eyebrow">{features.links.eyebrow}</p>
                  <h2>{features.links.heading}</h2>
                </div>
                <Link className="text-link" href="/veille">
                  {features.links.action} <ArrowRight size={15} />
                </Link>
              </m.div>
              <div className="link-preview-grid">
                {bookmarks.map((bookmark) => (
                  <m.article key={bookmark.id} variants={riseItem}>
                    <span className="link-preview-cover" aria-hidden="true">
                      {bookmark.title.slice(0, 1)}
                    </span>
                    <strong>{bookmark.title}</strong>
                    <small>{bookmark.label}</small>
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
                  <p className="eyebrow">{features.admin.eyebrow}</p>
                  <h2>{features.admin.heading}</h2>
                </div>
                <Link className="text-link" href="/projets">
                  {features.admin.action} <ArrowRight size={15} />
                </Link>
              </m.div>
              <m.p variants={riseItem}>{features.admin.body}</m.p>
              <m.ul className="skill-chips" variants={riseItem}>
                {features.admin.chips.map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
              </m.ul>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  )
}
