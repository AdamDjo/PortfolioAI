import { ArrowUpRight, Github } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Stagger, StaggerItem } from '@/components/motion/primitives'
import { ProjectVisual } from '@/components/project-visual'
import { buildAlternates } from '@/i18n/metadata'
import { getPageLocale } from '@/i18n/params'
import { listProjects } from '@/lib/site-content'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/projets'>): Promise<Metadata> {
  const locale = await getPageLocale(params)
  const t = await getTranslations({ locale, namespace: 'Projects' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: buildAlternates(locale, '/projets'),
  }
}

async function ProjectsPage({ params }: PageProps<'/[locale]/projets'>) {
  const locale = await getPageLocale(params)
  setRequestLocale(locale)

  const [t, projects] = await Promise.all([getTranslations('Projects'), listProjects(locale)])

  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1>{t('title')}</h1>
        <p>{t('lead')}</p>
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
                    The two actions do not carry the same weight: seeing the
                    project live is the point of the card, reading the code comes
                    after. Hence the primary/secondary pair used site-wide,
                    rather than two links that look alike.
                  */}
                  <div className="project-links">
                    <a
                      className="button button-primary"
                      href={project.url}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {t('viewAction')} <ArrowUpRight size={16} />
                    </a>
                    {project.repositoryUrl ? (
                      <a
                        className="button button-secondary"
                        href={project.repositoryUrl}
                        rel="noreferrer noopener"
                        target="_blank"
                      >
                        <Github size={16} /> {t('codeAction')}
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
