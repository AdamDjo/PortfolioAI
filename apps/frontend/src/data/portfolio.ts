export interface Project {
  title: string
  description: string
  tags: string[]
  tone: 'violet' | 'coral' | 'ice'
  url: string
}

export interface Article {
  title: string
  excerpt: string
  category: string
  date: string
  readingTime: string
}

export const projects: Project[] = [
  {
    title: 'Nexora',
    description:
      'Dashboard d’analyse produit conçu pour rendre les signaux complexes immédiatement lisibles.',
    tags: ['Next.js', 'TypeScript'],
    tone: 'violet',
    url: '/projets#nexora',
  },
  {
    title: 'SaaS Landing',
    description:
      'Landing page éditoriale, rapide et structurée autour d’un parcours de conversion clair.',
    tags: ['React', 'Tailwind'],
    tone: 'coral',
    url: '/projets#saas-landing',
  },
  {
    title: 'Portfolio v2',
    description:
      'Portfolio conversationnel qui transforme les projets et compétences en expérience interactive.',
    tags: ['Next.js', 'Motion'],
    tone: 'ice',
    url: '/projets#portfolio-v2',
  },
]

export const articles: Article[] = [
  {
    title: 'Concevoir une interface autour d’un agent IA',
    excerpt:
      'Les choix de rythme, de feedback et de contrôle qui rendent une conversation réellement utile.',
    category: 'Design IA',
    date: '18 juillet 2026',
    readingTime: '6 min',
  },
  {
    title: 'Le vrai coût des composants client dans Next.js',
    excerpt:
      'Comment garder une interface vivante sans transformer toute l’application en bundle JavaScript.',
    category: 'Next.js',
    date: '09 juillet 2026',
    readingTime: '5 min',
  },
  {
    title: 'Une accessibilité qui améliore aussi le design',
    excerpt:
      'Focus, contrastes et hiérarchie : trois contraintes qui produisent de meilleures interfaces.',
    category: 'Accessibilité',
    date: '27 juin 2026',
    readingTime: '4 min',
  },
]
