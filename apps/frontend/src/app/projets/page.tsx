import Link from 'next/link'

import { Stagger, StaggerItem } from '@/components/motion/primitives'
import { projects } from '@/data/portfolio'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projets',
  description: 'Une sélection de projets frontend et produit.',
}

function ProjectsPage() {
  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">Travaux sélectionnés</p>
        <h1>Des produits clairs, rapides et utiles.</h1>
        <p>
          Chaque projet commence par une question simple : quelle friction doit réellement
          disparaître pour l’utilisateur ?
        </p>
      </header>
      <Stagger className="project-grid projects-page-grid" stagger={0.12}>
        {projects.map((project, index) => (
          <StaggerItem key={project.title}>
            <article
              className="project-card project-card-large"
              id={project.title.toLowerCase().replaceAll(' ', '-')}
            >
              <span className={`project-visual tone-${project.tone}`}>
                <span>
                  0{index + 1} · {project.title}
                </span>
              </span>
              <div className="project-card-body">
                <p className="eyebrow">{project.tags.join(' · ')}</p>
                <h2>{project.title}</h2>
                <p>{project.description}</p>
                <Link className="text-link" href={project.url}>
                  Voir l’étude de cas →
                </Link>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}

export { ProjectsPage as default }
