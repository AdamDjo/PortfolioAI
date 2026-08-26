import type { Locale } from '@/lib/i18n/config'

/**
 * Static editorial copy and metadata for the about page, one per locale.
 *
 * Content the site owner edits without touching code — profile, experiences —
 * comes from Payload instead. This file holds strings tied to the page's
 * structure, which change only when the page itself is redesigned.
 */
const en = {
  metadata: {
    title: 'About',
    description: 'Adem’s background, skills and approach to frontend work.',
  },
  hero: {
    eyebrow: 'About',
    portraitAlt: 'Illustration of a brain wired as a neural network',
  },
  stats: {
    yearsLabel: 'Years of experience',
  },
  skills: {
    eyebrow: 'Skills',
    heading: 'What I work with every day.',
  },
  career: {
    eyebrow: 'Background',
    heading: 'Where I have worked, and on what.',
  },
  principles: {
    eyebrow: 'Principles',
    heading: 'How I work.',
  },
}

type AboutContent = typeof en

const fr: AboutContent = {
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
}

const ABOUT_CONTENT: Record<Locale, AboutContent> = { en, fr }

export function getAboutContent(locale: Locale): AboutContent {
  return ABOUT_CONTENT[locale]
}
