'use client'

import { ArrowRight, ChevronDown, Github, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'
import { ProjectVisual } from '@/components/project-visual'

import { Tilt } from './tilt'

import type { HomeProject } from './types'

const PROMPT_KEYS = ['prompt1', 'prompt2', 'prompt3', 'prompt4'] as const

/** Cards shown before the visitor asks for more: one row of the desktop grid. */
const VISIBLE_COUNT = 3

interface ProjectsTeaserProps {
  /** Every public project, featured ones first. */
  projects: HomeProject[]
  onAskQuestion: (question: string) => void
}

/**
 * The home page projects section — the only place projects are listed.
 *
 * The first row is always visible; the rest sit in a collapsible region below
 * it. They are rendered on the server either way, so every project stays in the
 * HTML a crawler reads, and the region is only `inert` while closed so a
 * keyboard user cannot tab into cards they cannot see.
 */
export function ProjectsTeaser({ projects, onAskQuestion }: ProjectsTeaserProps) {
  const t = useTranslations('Home.projects')
  const [expanded, setExpanded] = useState(false)
  const regionId = useId()

  const visible = projects.slice(0, VISIBLE_COUNT)
  const more = projects.slice(VISIBLE_COUNT)

  return (
    <section
      className="home-projects shell"
      id="projects"
      aria-labelledby="selected-projects-title"
    >
      <div className="home-projects-main">
        <Reveal>
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{t('eyebrow')}</p>
              <h2 id="selected-projects-title">{t('heading')}</h2>
            </div>
          </div>
        </Reveal>
        <Stagger className="project-grid project-grid-home" stagger={0.09}>
          {visible.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </Stagger>

        {more.length > 0 ? (
          <>
            <div
              className={expanded ? 'home-projects-more is-open' : 'home-projects-more'}
              id={regionId}
              inert={!expanded}
            >
              <div className="home-projects-more-inner">
                <Stagger className="project-grid project-grid-home" stagger={0.07}>
                  {more.map((project, index) => (
                    <ProjectCard key={project.id} project={project} index={index + VISIBLE_COUNT} />
                  ))}
                </Stagger>
              </div>
            </div>
            <button
              className="home-projects-toggle"
              aria-controls={regionId}
              aria-expanded={expanded}
              onClick={() => setExpanded((current) => !current)}
              type="button"
            >
              {expanded ? t('showLess') : t('showAll', { count: projects.length })}
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      <Reveal className="home-project-assistant-reveal">
        <aside className="home-project-assistant" aria-label={t('assistantHeading')}>
          <h2>
            <Sparkles size={17} aria-hidden="true" /> {t('assistantHeading')}
          </h2>
          <div className="home-project-prompts">
            {PROMPT_KEYS.map((key) => (
              <button key={key} onClick={() => onAskQuestion(t(key))} type="button">
                {t(key)} <ArrowRight size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
          <button
            className="home-project-assistant-cta"
            onClick={() => onAskQuestion('')}
            type="button"
          >
            {t('assistantAction')} <ArrowRight size={16} aria-hidden="true" />
          </button>
          <div className="home-project-helper" aria-hidden="true">
            <span>{t('helper')}</span>
            <Image
              src="/images/adem-assistant-helper.webp"
              alt=""
              width={320}
              height={320}
              sizes="92px"
            />
          </div>
        </aside>
      </Reveal>
    </section>
  )
}

function ProjectCard({ project, index }: { project: HomeProject; index: number }) {
  const t = useTranslations('Home.projects')

  return (
    <StaggerItem variant="scale" className="card-fill">
      <Tilt max={6} className="card-fill home-project-card-frame">
        {/* Projects are hosted elsewhere: external link, not internal navigation. */}
        <a
          className="project-card home-project-card"
          href={project.url}
          rel="noreferrer noopener"
          target="_blank"
        >
          <ProjectVisual imageUrl={project.imageUrl} title={project.title} index={index} />
          <span className="home-project-card-body">
            <strong>{project.title}</strong>
            {project.description ? <small>{project.description}</small> : null}
            <span className="home-project-meta">
              <span className="home-project-tags">
                {project.technologies.slice(0, 3).map((technology) => (
                  <i key={technology}>{technology}</i>
                ))}
              </span>
              <span className="home-project-arrow" aria-hidden="true">
                <ArrowRight size={15} />
              </span>
            </span>
          </span>
        </a>
        {/*
          A sibling of the card link rather than a child: an anchor inside an
          anchor is invalid HTML, and browsers split it into two broken links.
        */}
        {project.repositoryUrl ? (
          <a
            className="home-project-code"
            href={project.repositoryUrl}
            aria-label={t('codeAriaLabel', { name: project.title })}
            rel="noreferrer noopener"
            target="_blank"
          >
            <Github size={15} aria-hidden="true" />
          </a>
        ) : null}
      </Tilt>
    </StaggerItem>
  )
}
