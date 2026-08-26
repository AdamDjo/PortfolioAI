import { ArrowUpRight, Github } from 'lucide-react'

import { Stagger, StaggerItem } from '@/components/motion/primitives'
import { ProjectVisual } from '@/components/project-visual'
import { buildPageMetadata } from '@/lib/i18n/metadata'
import { resolveLocale } from '@/lib/i18n/server'
import { listProjects } from '@/lib/site-content'

import { getProjectsContent } from './_content'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/projets'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const { metadata } = getProjectsContent(locale)
  return buildPageMetadata({ locale, path: '/projets', ...metadata })
}

async function ProjectsPage({ params }: PageProps<'/[lang]/projets'>) {
  const locale = await resolveLocale(params)
  const projects = await listProjects()
  const { heading, card } = getProjectsContent(locale)

  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">{heading.eyebrow}</p>
        <h1>{heading.title}</h1>
        <p>{heading.lead}</p>
      </header>
      <Stagger className="project-grid projects-page-grid" stagger={0.12}>
        {projects.map((project, index) => {
          // The uploaded visual takes precedence over the automatic preview.
          const image = project.coverUrl ?? project.previewImageUrl

          return (
            <StaggerItem key={project.id}>
              <article className="project-card project-card-large">
                <ProjectVisual imageUrl={image} title={project.title} index={index} />
                <div className="project-card-body">
                  {project.technologies.length > 0 ? (
                    <p className="eyebrow">{project.technologies.join(' · ')}</p>
                  ) : null}
                  <h2>{project.title}</h2>
                  {project.description ? <p>{project.description}</p> : null}
                  {/*
                    Les deux actions n'ont pas le même poids : voir le projet en
                    ligne est la raison d'être de la fiche, lire le code vient
                    ensuite. D'où le couple primaire/secondaire du reste du site,
                    plutôt que deux liens de même apparence.
                  */}
                  <div className="project-links">
                    <a
                      className="button button-primary"
                      href={project.url}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {card.viewAction} <ArrowUpRight size={16} />
                    </a>
                    {project.repositoryUrl ? (
                      <a
                        className="button button-secondary"
                        href={project.repositoryUrl}
                        rel="noreferrer noopener"
                        target="_blank"
                      >
                        <Github size={16} /> {card.codeAction}
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </StaggerItem>
          )
        })}
      </Stagger>
    </div>
  )
}

export { ProjectsPage as default }
