/**
 * Static editorial copy and metadata for the projects page.
 *
 * The projects themselves come from Payload instead — this file only holds
 * strings tied to the page's structure.
 */
export const PROJECTS_CONTENT = {
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
} as const
