import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { HOME_CONTENT } from '@/app/(site)/(home)/_content'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'
import { Tilt } from '@/components/motion/tilt'
import { ProjectVisual } from '@/components/project-visual'

import type { HomeProject } from './types'

const { about, projects: copy } = HOME_CONTENT

export function ProjectsTeaser({ projects }: { projects: HomeProject[] }) {
  return (
    <section className="intro-projects shell">
      <Reveal className="about-teaser-reveal">
        <article className="about-teaser">
          <p className="eyebrow">{about.eyebrow}</p>
          <h2>{about.heading}</h2>
          <p>{about.body}</p>
          <Link className="text-link" href="/a-propos">
            {about.action} <ArrowRight size={15} />
          </Link>
        </article>
      </Reveal>
      <div className="projects-teaser">
        <Reveal>
          <div className="section-title-row">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h2>{copy.heading}</h2>
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
                  className="project-card"
                  href={project.url}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <ProjectVisual imageUrl={project.imageUrl} title={project.title} index={index} />
                  <strong>{project.title}</strong>
                  <small>{project.technologies.join(' / ')}</small>
                </a>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
