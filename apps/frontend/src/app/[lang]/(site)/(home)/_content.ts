import type { Locale } from '@/lib/i18n/config'

/**
 * Static editorial copy for the home page, one version per locale.
 *
 * Content that the site owner edits without touching code — projects, bookmarks,
 * identity — comes from Payload instead. This file holds strings tied to the
 * page's structure, which change only when the page itself is redesigned.
 *
 * `en` is written first and its inferred shape types every other locale, so a
 * missing or misspelled key fails the type check rather than rendering blank.
 */
const en = {
  hero: {
    titleLines: ['I turn ideas', 'into interfaces', 'that feel effortless.'],
    lead: 'Frontend developer focused on building modern, fast and accessible web experiences.',
    primaryAction: 'See my work',
    secondaryAction: 'Get in touch',
  },
  chat: {
    header: 'Chat with my portfolio',
    status: 'Online',
    userMessage: 'Hi there! 👋',
    aiMessage: 'Ask me about my projects, my background, my skills or how I work.',
    inputLabel: 'Ask your question',
    inputPlaceholder: 'Ask your question…',
    submitLabel: 'Send',
    feedbackPrompt: 'Was this answer helpful?',
    feedbackUseful: 'Helpful answer',
    feedbackNotUseful: 'Unhelpful answer',
    feedbackThanks: 'Thanks for the feedback.',
    privacyLink: 'Learn more',
  },
  profile: {
    heading: 'Profile',
    action: 'See my background',
  },
  skills: {
    heading: 'Skills',
    fallback: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js'],
  },
  stats: {
    projects: 'Projects shipped',
    experience: 'Years of experience',
    satisfaction: 'Commitment',
  },
  railLabel: 'Home page shortcuts',
  rail: [
    {
      id: 'assistant',
      title: 'AI assistant',
      description: 'Ask a question, get an answer.',
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Take a look at what I build.',
    },
    {
      id: 'journey',
      title: 'Background',
      description: 'My experience and career path.',
    },
    {
      id: 'contact',
      title: 'Details',
      description: 'Contact details and availability.',
    },
  ],
  features: {
    heading: 'Explore what this site does',
    ai: {
      eyebrow: 'An answer, not a form',
      heading: 'Explore my work by asking a real question.',
      body: 'The chat is a fast way into my projects, my skills and the way I work.',
      prompts: [
        {
          label: 'My best Next.js project',
          question: 'Which project best shows your Next.js skills?',
        },
        {
          label: 'How I collaborate',
          question: 'How do you work with a product team?',
        },
      ],
    },
    links: {
      eyebrow: 'Personal library',
      heading: 'The references I keep close at hand.',
      action: 'Open the collection',
    },
    admin: {
      eyebrow: 'Under the hood',
      heading: 'Every part of this site is editable, nothing is hardcoded.',
      action: 'See the result',
      body: 'Career, projects and reading list all come from a Payload CMS mounted inside this same Next.js app. Pages stay server components: content is rendered on the server, not fetched from the browser.',
      chips: ['Payload 3', 'PostgreSQL', 'Versioned migrations', 'Admin-only writes'],
    },
  },
  about: {
    eyebrow: 'About me',
    heading: 'I turn ideas into interfaces that feel effortless.',
    body: 'Senior frontend developer in R&D at a software company: rebuilding a legacy product in React, a shared design system, and AI tooling for the team.',
    action: 'Discover my background',
  },
  projects: {
    eyebrow: 'Selected projects',
    heading: 'A few things I have built',
    action: 'See every project',
    assistantHeading: 'Ask my AI',
    prompts: [
      'Tell me about your best project',
      'Which technologies do you use?',
      'How do you work?',
      'What is your background?',
    ],
    assistantAction: 'Chat with my portfolio',
    helper: 'I’m here to help!',
  },
  quality: [
    { label: 'Fast', detail: 'Sites tuned for performance.' },
    { label: 'Responsive', detail: 'A polished experience on every screen.' },
    { label: 'Accessible', detail: 'Inclusive, modern interfaces.' },
    { label: 'SEO friendly', detail: 'Built to be found.' },
  ],
}

type HomeContent = typeof en

const fr: HomeContent = {
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
    feedbackPrompt: 'Cette réponse vous a-t-elle aidé ?',
    feedbackUseful: 'Réponse utile',
    feedbackNotUseful: 'Réponse pas utile',
    feedbackThanks: 'Merci pour votre retour.',
    privacyLink: 'En savoir plus',
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
  railLabel: 'Raccourcis de la page d’accueil',
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
    helper: 'Je suis là pour aider\u00a0!',
  },
  quality: [
    { label: 'Rapide', detail: 'Sites optimisés pour la performance.' },
    { label: 'Responsive', detail: 'Expérience parfaite sur tous les écrans.' },
    { label: 'Accessible', detail: 'Des interfaces inclusives et modernes.' },
    { label: 'SEO Friendly', detail: 'Optimisées pour le référencement.' },
  ],
}

const HOME_CONTENT: Record<Locale, HomeContent> = { en, fr }

export function getHomeContent(locale: Locale): HomeContent {
  return HOME_CONTENT[locale]
}
