/**
 * Static editorial copy and metadata for the legal notice page.
 *
 * The publisher, host and data policy come from Payload instead — this file
 * only holds strings tied to the page's structure and the fallback copy shown
 * when a field has not been filled in yet.
 */
export const LEGAL_CONTENT = {
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
      contactLabel: 'Contact',
      fallback:
        'L’identité de l’éditeur sera précisée ici avant la mise en ligne publique du site.',
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
    },
  },
} as const
