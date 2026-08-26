import type { Locale } from '@/lib/i18n/config'

/**
 * Static editorial copy and metadata for the legal notice page, one per locale.
 *
 * The publisher, host and data policy come from Payload instead — this file
 * only holds strings tied to the page's structure and the fallback copy shown
 * when a field has not been filled in yet.
 */
const en = {
  metadata: {
    title: 'Legal notice',
    description: 'Publisher, host and data handling for this site.',
  },
  heading: {
    eyebrow: 'Information',
    title: 'Legal notice',
  },
  sections: {
    publisher: {
      title: 'Publisher',
      contactLabel: 'Contact:',
      fallback: 'The publisher’s identity will be stated here before the site goes public.',
      statement: (publisher: string, role: string, location: string) =>
        `This site is published in a personal capacity by ${publisher}, ${role}${location ? `, ${location}` : ''}.`,
    },
    hosting: {
      title: 'Hosting',
      fallback: 'The host will be stated here before the site goes public.',
    },
    dataPolicy: {
      title: 'Personal data',
      fallback:
        'This site sets no analytics cookie and collects no browsing data. The only choice kept is the light or dark theme preference, stored locally in the browser and never transmitted.',
    },
    intellectualProperty: {
      title: 'Intellectual property',
      body: (owner: string) =>
        `The text and visuals on this site belong to ${owner}, unless stated otherwise. The source code of the projects shown is published under an open licence in the repositories listed.`,
    },
  },
}

type LegalContent = typeof en

const fr: LegalContent = {
  metadata: {
    title: 'Mentions légales',
    description: 'Éditeur, hébergeur et traitement des données de ce site.',
  },
  heading: {
    eyebrow: 'Informations',
    title: 'Mentions légales',
  },
  sections: {
    publisher: {
      title: 'Éditeur',
      contactLabel: 'Contact :',
      fallback:
        'L’identité de l’éditeur sera précisée ici avant la mise en ligne publique du site.',
      statement: (publisher: string, role: string, location: string) =>
        `Ce site est édité à titre personnel par ${publisher}, ${role}${location ? `, ${location}` : ''}.`,
    },
    hosting: {
      title: 'Hébergement',
      fallback: 'L’hébergeur sera précisé ici avant la mise en ligne publique du site.',
    },
    dataPolicy: {
      title: 'Données personnelles',
      fallback:
        'Ce site ne dépose aucun cookie de mesure d’audience et ne collecte aucune donnée de navigation. Le seul choix conservé est la préférence de thème clair ou sombre, stockée localement dans le navigateur et jamais transmise.',
    },
    intellectualProperty: {
      title: 'Propriété intellectuelle',
      body: (owner: string) =>
        `Les textes et visuels de ce site sont la propriété de ${owner}, sauf mention contraire. Le code source des projets présentés est publié sous licence libre sur les dépôts indiqués.`,
    },
  },
}

const LEGAL_CONTENT: Record<Locale, LegalContent> = { en, fr }

export function getLegalContent(locale: Locale): LegalContent {
  return LEGAL_CONTENT[locale]
}
