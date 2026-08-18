/**
 * Static editorial copy and metadata for the about page.
 *
 * Content the site owner edits without touching code — profile, experiences —
 * comes from Payload instead. This file holds strings tied to the page's
 * structure, which change only when the page itself is redesigned.
 */
export const ABOUT_CONTENT = {
  metadata: {
    title: 'À propos',
    description: 'Le parcours, les compétences et l’approche frontend d’Adem.',
  },
  hero: {
    eyebrow: 'À propos',
    portraitAlt: 'Illustration d’un cerveau relié par un réseau neuronal',
  },
  stats: {
    yearsLabel: 'Années d’expérience',
  },
  skills: {
    eyebrow: 'Compétences',
    heading: 'Ce que j’utilise au quotidien.',
  },
  career: {
    eyebrow: 'Parcours',
    heading: 'Où j’ai travaillé, et sur quoi.',
  },
  principles: {
    eyebrow: 'Principes',
    heading: 'Comment je travaille.',
  },
} as const
