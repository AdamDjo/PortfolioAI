import type { Locale } from '@/lib/i18n/config'

/**
 * Static editorial copy and metadata for the projects page, one per locale.
 *
 * The projects themselves come from Payload instead — this file only holds
 * strings tied to the page's structure.
 */
const en = {
  metadata: {
    title: 'Projects',
    description: 'A selection of personal projects, live and open to browse.',
  },
  heading: {
    eyebrow: 'Personal projects',
    title: 'Live projects, not mockups.',
    lead: 'Every project below is deployed and its code is open. My client work covers internal back-offices: they are described in my background, with no public link to show.',
  },
  card: {
    viewAction: 'View project',
    codeAction: 'Source code',
  },
}

type ProjectsContent = typeof en

const fr: ProjectsContent = {
  metadata: {
    title: 'Projets',
    description: 'Une sélection de projets personnels, en ligne et consultables.',
  },
  heading: {
    eyebrow: 'Projets personnels',
    title: 'Des projets en ligne, pas des maquettes.',
    lead: 'Chaque projet ci-dessous est déployé et son code est ouvert. Mes missions en entreprise portent sur des back-offices internes : elles sont décrites dans mon parcours, sans lien public à montrer.',
  },
  card: {
    viewAction: 'Voir le projet',
    codeAction: 'Code source',
  },
}

const PROJECTS_CONTENT: Record<Locale, ProjectsContent> = { en, fr }

export function getProjectsContent(locale: Locale): ProjectsContent {
  return PROJECTS_CONTENT[locale]
}
