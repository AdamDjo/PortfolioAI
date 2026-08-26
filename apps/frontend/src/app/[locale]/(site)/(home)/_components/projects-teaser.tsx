'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'
import { ProjectVisual } from '@/components/project-visual'
import { Link } from '@/i18n/navigation'

import { Tilt } from './tilt'

import type { HomeProject } from './types'

const PROMPT_KEYS = ['prompt1', 'prompt2', 'prompt3', 'prompt4'] as const

interface ProjectsTeaserProps {
  projects: HomeProject[]
  onAskQuestion: (question: string) => void
}

export function ProjectsTeaser({ projects, onAskQuestion }: ProjectsTeaserProps) {
  const t = useTranslations('Home.projects')
  return (
    <section className="home-projects shell" aria-labelledby="selected-projects-title">
      <div className="home-projects-main">
        <Reveal>
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{t('eyebrow')}</p>
              <h2 id="selected-projects-title">{t('heading')}</h2>
            </div>
            <Link className="text-link" href="/projets">
              {t('action')} <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>
        <Stagger className="project-grid project-grid-home" stagger={0.09}>
          {projects.map((project, index) => (
            <StaggerItem key={project.id} variant="scale" className="card-fill">
              <Tilt max={6} className="card-fill">
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
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
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
