/**
 * Static editorial copy for the home page.
 *
 * Content that the site owner edits without touching code — projects, bookmarks,
 * identity — comes from Payload instead. This file holds strings tied to the
 * page's structure, which change only when the page itself is redesigned.
 */
export const HOME_CONTENT = {
  hero: {
    titleLines: ['Je transforme', 'des idées en', 'interfaces nettes.'],
    lead: 'Développeur frontend passionné par la création d’expériences web modernes, rapides et accessibles.',
    primaryAction: 'Voir mes projets',
    secondaryAction: 'Me contacter',
  },
  chat: {
    header: 'Discuter avec mon portfolio',
    status: 'En ligne',
    userMessage: 'Bonjour ! 👋',
    aiMessage:
      'Pose-moi une question sur mes projets, mon parcours, mes compétences ou ma façon de travailler.',
    inputLabel: 'Posez votre question',
    inputPlaceholder: 'Posez votre question…',
    submitLabel: 'Envoyer',
  },
  profile: {
    heading: 'Profil',
    action: 'Voir mon parcours',
  },
  skills: {
    heading: 'Compétences',
    fallback: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js'],
  },
  stats: {
    projects: 'Projets réalisés',
    experience: 'Ans d’expérience',
    satisfaction: 'Engagement',
  },
  rail: [
    {
      id: 'assistant',
      title: 'Assistant IA',
      description: 'Posez une question, obtenez une réponse.',
    },
    {
      id: 'projects',
      title: 'Projets',
      description: 'Découvrez mes réalisations.',
    },
    {
      id: 'journey',
      title: 'Parcours',
      description: 'Mon expérience et mon parcours.',
    },
    {
      id: 'contact',
      title: 'Informations',
      description: 'Coordonnées et disponibilités.',
    },
  ],
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
    eyebrow: 'Projets sélectionnés',
    heading: 'Quelques réalisations',
    action: 'Voir tous les projets',
    assistantHeading: 'Demandez à mon IA',
    prompts: [
      'Parle-moi de ton meilleur projet',
      'Quelles technologies utilises-tu ?',
      'Comment travailles-tu ?',
      'Quel est ton parcours ?',
    ],
    assistantAction: 'Discuter avec mon portfolio',
  },
  quality: [
    { label: 'Rapide', detail: 'Sites optimisés pour la performance.' },
    { label: 'Responsive', detail: 'Expérience parfaite sur tous les écrans.' },
    { label: 'Accessible', detail: 'Des interfaces inclusives et modernes.' },
    { label: 'SEO Friendly', detail: 'Optimisées pour le référencement.' },
  ],
} as const
