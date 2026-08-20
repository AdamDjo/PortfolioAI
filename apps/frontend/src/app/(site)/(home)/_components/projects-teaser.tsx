import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { HOME_CONTENT } from '@/app/(site)/(home)/_content'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'
import { ProjectVisual } from '@/components/project-visual'

import { Tilt } from './tilt'

import type { HomeProject } from './types'

const { projects: copy } = HOME_CONTENT

interface ProjectsTeaserProps {
  projects: HomeProject[]
  onAskQuestion: (question: string) => void
}

export function ProjectsTeaser({ projects, onAskQuestion }: ProjectsTeaserProps) {
  return (
    <section className="home-projects shell" aria-labelledby="selected-projects-title">
      <div className="home-projects-main">
        <Reveal>
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h2 id="selected-projects-title">{copy.heading}</h2>
            </div>
            <Link className="text-link" href="/projets">
              {copy.action} <ArrowRight size={15} />
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
        <aside className="home-project-assistant" aria-label={copy.assistantHeading}>
          <h2>
            <Sparkles size={17} aria-hidden="true" /> {copy.assistantHeading}
          </h2>
          <div className="home-project-prompts">
            {copy.prompts.map((prompt) => (
              <button key={prompt} onClick={() => onAskQuestion(prompt)} type="button">
                {prompt} <ArrowRight size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
          <button
            className="home-project-assistant-cta"
            onClick={() => onAskQuestion('')}
            type="button"
          >
            {copy.assistantAction} <ArrowRight size={16} aria-hidden="true" />
          </button>
        </aside>
      </Reveal>
    </section>
  )
}
