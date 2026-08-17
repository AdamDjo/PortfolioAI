/**
 * Static editorial copy for the home page.
 *
 * Content that the site owner edits without touching code — projects, bookmarks,
 * identity — comes from Payload instead. This file holds strings tied to the
 * page's structure, which change only when the page itself is redesigned.
 */
export const HOME_CONTENT = {
  hero: {
    availability: 'Disponible pour des opportunités',
    titleLeading: 'Discute avec',
    titleTrailing: 'mon ',
    titleAccent: 'cerveau',
    lead: ['Pose-moi n’importe quelle question.', 'Mon IA vous répond instantanément.'],
    primaryAction: 'Commencer à discuter',
    secondaryAction: 'En savoir plus',
  },
  chat: {
    header: 'Conversation avec mon portfolio',
    status: 'En ligne',
    userMessage: 'Bonjour, qui es-tu ?',
    aiMessage:
      'Salut, je suis Adem. Je conçois des expériences web modernes, rapides et accessibles avec React, Next.js et TypeScript.',
    inputLabel: 'Posez votre question',
    inputPlaceholder: 'Posez votre question…',
    submitLabel: 'Envoyer',
    cannedAnswer:
      'Je peux te parler de mes projets, de mon approche frontend ou de la façon dont j’utilise Next.js.',
  },
  features: {
    heading: 'Découvrez mes fonctionnalités',
    ai: {
      eyebrow: 'Une réponse, pas un formulaire',
      heading: 'Explore mon travail en posant une vraie question.',
      body: 'Le chat devient un point d’entrée rapide vers mes projets, mes compétences et ma façon de travailler.',
      prompts: [
        {
          label: 'Mon meilleur projet Next.js',
          question: 'Quel projet montre le mieux ton niveau en Next.js ?',
        },
        {
          label: 'Ma façon de collaborer',
          question: 'Comment travailles-tu avec une équipe produit ?',
        },
      ],
    },
    links: {
      eyebrow: 'Bibliothèque personnelle',
      heading: 'Les références que je garde sous la main.',
      action: 'Ouvrir la collection',
    },
    admin: {
      eyebrow: 'Sous le capot',
      heading: 'Tout ce site est éditable, rien n’est écrit en dur.',
      action: 'Voir le résultat',
      body: 'Parcours, projets et veille viennent d’un CMS Payload monté dans la même application Next.js. Les pages restent des composants serveur : le contenu est rendu côté serveur, pas récupéré depuis le navigateur.',
      chips: [
        'Payload 3',
        'PostgreSQL',
        'Migrations versionnées',
        'Écriture réservée à l’administrateur',
      ],
    },
  },
  about: {
    eyebrow: 'À propos de moi',
    heading: 'Je transforme des idées en interfaces nettes.',
    body: 'Développeur frontend senior en R&D chez un éditeur logiciel : refonte d’un produit legacy en React, design system partagé et outillage IA pour l’équipe.',
    action: 'Découvrir mon parcours',
  },
  projects: {
    eyebrow: 'Sélection',
    heading: 'Mes derniers projets',
    action: 'Voir tous',
  },
  quality: ['Rapide', 'Responsive', 'Accessible', 'SEO Friendly'],
} as const
