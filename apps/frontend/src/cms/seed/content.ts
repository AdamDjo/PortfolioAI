/**
 * Real portfolio content, kept in one place.
 *
 * Every value here is sourced from the CV or stated directly by the site owner.
 * Nothing is invented: a portfolio has to be defensible in an interview, so an
 * approximate figure is worse than no figure at all.
 *
 * This is seed data, not runtime data. Once written to Payload, the admin panel
 * is the source of truth — this file only bootstraps an empty database.
 */

import type { Profile, SiteIdentity } from '@/payload-types'

interface ExperienceSeed {
  company: string
  role: string
  location: string
  startDate: string
  endDate?: string
  current?: boolean
  project?: string
  context?: string
  achievements: string[]
  technologies: string[]
}

interface ProjectSeed {
  url: string
  repositoryUrl: string
  title: string
  description: string
  technologies: string[]
  featured: boolean
  order: number
}

/**
 * Globals are typed against the generated Payload types rather than inferred, so a
 * schema change breaks the seed at compile time instead of at runtime. The
 * Payload-managed fields are omitted: the database assigns them.
 */
const identity: Omit<SiteIdentity, 'id' | 'createdAt' | 'updatedAt'> = {
  contact: {
    displayName: 'Adem',
    role: 'Senior Frontend Developer',
    location: 'Île-de-France, Paris',
    email: 'adem.benmessaoud.dev@gmail.com',
  },
  social: {
    githubUrl: 'https://github.com/AdamDjo',
    linkedinUrl: 'https://www.linkedin.com/in/adem-benmessaoud-dev',
  },
  legal: {
    // The site presents itself under the first name alone; the law, however,
    // requires a full identity for the publisher, and the legal notice is the
    // only page that displays it.
    publisher: 'Adem Ben Messaoud',
  },
}

const profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> = {
  headline: 'Je construis l’interface entre une idée et son usage.',
  bio: 'Senior frontend developer en R&D chez CAST Software, je reconstruis une plateforme SaaS d’analyse de code depuis zéro en React 19. Je travaille sur ce qui rend une équipe rapide autant que sur l’interface elle-même : design system, conventions partagées, et outillage assisté par IA.',
  yearsOfExperience: 8,
  skillGroups: [
    {
      label: 'Frontend',
      items: ['React 19', 'Next.js', 'TypeScript', 'Redux', 'Zustand', 'TanStack Query'],
    },
    {
      label: 'Interface et design system',
      items: ['Material UI', 'Tailwind CSS', 'Storybook', 'Accessibilité', 'Motion'],
    },
    {
      label: 'Qualité et outillage',
      items: ['Vitest', 'Playwright', 'ESLint', 'Turborepo', 'GitHub Actions', 'Docker'],
    },
    {
      label: 'Backend et données',
      items: ['Node.js', 'Payload CMS', 'PostgreSQL', 'REST', 'Solidity'],
    },
    {
      label: 'Développement assisté par IA',
      items: ['Claude Code', 'Codex', 'Configuration agentique .md', 'Hooks et slash commands'],
    },
  ],
  principles: [
    {
      statement: 'Comprendre avant de composer.',
      detail:
        'Je pars du parcours réel et de la contrainte métier, pas d’un écran isolé à reproduire.',
    },
    {
      statement: 'Rendre les états explicites.',
      detail:
        'Chargement, vide, erreur et succès sont conçus ensemble : un état oublié est un bug livré.',
    },
    {
      statement: 'Mesurer avant d’optimiser.',
      detail: 'Lighthouse et les tests end-to-end décident, pas l’intuition.',
    },
    {
      statement: 'Outiller l’équipe, pas seulement le produit.',
      detail:
        'Conventions partagées, revue automatisée et documentation exécutable : ce qui tient sans moi.',
    },
  ],
}

/**
 * Career path, most recent first.
 *
 * Dates are month-precision, which is why they are stored as the first day of the
 * month: the admin panel renders them as MM/yyyy and the day carries no meaning.
 */
const experiences: ExperienceSeed[] = [
  {
    company: 'CAST Software',
    role: 'Senior Frontend Developer, R&D',
    location: 'Paris, France',
    startDate: '2025-08-01',
    current: true,
    project:
      'CAST Highlight — SaaS software intelligence platform analysing application portfolios for cloud readiness, open source risk, resiliency and technical debt.',
    context:
      'Cross-functional R&D team of eight (two frontend, two fullstack, one designer, one QA, one product owner) rebuilding CAST Highlight from scratch, migrating a legacy codebase to a modern React 19 stack.',
    achievements: [
      'Lead the frontend workstream, guiding two developers based in India across time zones through code review, documentation and shared conventions.',
      'Rebuild the platform from the ground up in React 19, replacing the legacy front end screen by screen without interrupting delivery.',
      'Build the in-house design system on top of Material UI, in close collaboration with the product designer.',
      'Introduced AI-assisted development practices within the R&D team: custom Claude Code slash commands, hooks, automated code review, and a /fix <ticket> workflow that automates ticket resolution.',
      'Trained the team on agentic tooling adoption, including .md-based agent configuration, giving a distributed team a consistent way of working.',
    ],
    technologies: [
      'React 19',
      'TypeScript',
      'Material UI',
      'Zustand',
      'TanStack Query',
      'Vitest',
      'Playwright',
      'Storybook',
      'Turborepo',
      'Claude Code',
      'Codex',
    ],
  },
  {
    company: 'Canal+',
    role: 'Frontend Developer',
    location: 'Issy-les-Moulineaux, France',
    startDate: '2024-01-01',
    endDate: '2025-07-01',
    project: 'Osmose — internal broadcasting and content management back office.',
    context:
      'Product team maintaining and extending the internal tooling used by the broadcasting teams.',
    achievements: [
      'Developed and maintained back-office interfaces used daily by internal broadcasting teams.',
      'Built reusable React components and shared form logic to keep screens consistent across modules.',
    ],
    technologies: ['React', 'TypeScript', 'Redux', 'REST', 'Jest'],
  },
  {
    company: 'Orange',
    role: 'Frontend Developer',
    location: 'Île-de-France, France',
    startDate: '2021-11-01',
    endDate: '2023-11-01',
    project: 'Omnis — internal management back office.',
    context: 'Agile team delivering internal business applications.',
    achievements: [
      'Implemented and maintained front-end features for internal business applications.',
      'Worked within an agile delivery cycle alongside back-end and QA engineers.',
    ],
    technologies: ['Angular', 'TypeScript', 'RxJS', 'SCSS'],
  },
  {
    company: 'Atayen',
    role: 'Frontend Developer',
    location: 'France',
    startDate: '2020-02-01',
    endDate: '2021-09-01',
    context: 'Product team building web applications for a small structure.',
    achievements: [
      'Developed web interfaces from design mock-ups through to production.',
      'Integrated third-party APIs and handled cross-browser behaviour.',
    ],
    technologies: ['React', 'JavaScript', 'Node.js', 'CSS'],
  },
  {
    company: 'MdSoft',
    role: 'Web Developer',
    location: 'Tunisia',
    startDate: '2017-12-01',
    endDate: '2019-12-01',
    context: 'Service company delivering web projects for external clients.',
    achievements: [
      'Delivered client web projects end to end, from integration to deployment.',
      'Maintained existing applications and fixed production issues.',
    ],
    technologies: ['JavaScript', 'PHP', 'HTML', 'CSS', 'MySQL'],
  },
]

/**
 * Personal projects only, and only ones with a live URL.
 *
 * The employed missions above are internal back offices with no public address,
 * so they stay in the career path and are deliberately absent here.
 */
const projects: ProjectSeed[] = [
  {
    url: 'https://grimoire-game-frontend.vercel.app',
    repositoryUrl: 'https://github.com/AdamDjo/Grimoire-game',
    title: 'Grimoire',
    description:
      'Jeu web en monorepo pnpm et Turborepo, conçu comme un banc d’essai de mes pratiques d’équipe : configuration agentique en .md, revue automatisée, Docker, hooks de commit et intégration continue.',
    technologies: ['TypeScript', 'Turborepo', 'pnpm', 'Docker', 'GitHub Actions', 'Claude Code'],
    featured: true,
    order: 0,
  },
  {
    url: 'https://ethswap-dapp.vercel.app',
    repositoryUrl: 'https://github.com/AdamDjo/Ethswap-Dapp',
    title: 'Ethswap',
    description:
      'Application décentralisée d’échange de jetons sur le réseau Sepolia : connexion MetaMask, lecture des soldes et transferts, avec le contrat Solidity écrit et déployé pour l’occasion.',
    technologies: ['Solidity', 'React', 'TypeScript', 'ethers.js', 'MetaMask'],
    featured: true,
    order: 1,
  },
  {
    url: 'https://fitapp-redux.vercel.app',
    repositoryUrl: 'https://github.com/AdamDjo/Fitapp-Redux',
    title: 'Fitapp',
    description:
      'Suivi d’entraînement en Next.js et Redux : composition de séances, persistance de l’état et interface pensée d’abord pour le mobile.',
    technologies: ['Next.js', 'React', 'Redux', 'TypeScript'],
    featured: false,
    order: 2,
  },
]

/**
 * English versions of the fields marked `localized` in the CMS.
 *
 * Only those fields appear here: everything else — names, URLs, dates,
 * technologies — is single-valued by design and lives in the French objects
 * above. Keeping the two side by side makes a missing translation visible when
 * reading the file, which a separate file would hide.
 *
 * The career path is deliberately absent: it is already written in English, so
 * the seeded values serve both languages. Writing French versions of it is an
 * editorial decision, not a technical gap.
 */
const identityEn = {
  contact: {
    // The French form names the region first, which reads backwards in English.
    location: 'Paris, France',
  },
}

const profileEn = {
  headline: 'I build the interface between an idea and the people who use it.',
  bio: 'Senior frontend developer in R&D at CAST Software, rebuilding a SaaS code-analysis platform from scratch in React 19. I work on what makes a team fast as much as on the interface itself: design system, shared conventions, and AI-assisted tooling.',
  skillGroupLabels: [
    'Frontend',
    'Interface and design system',
    'Quality and tooling',
    'Backend and data',
    'AI-assisted development',
  ],
  principles: [
    {
      statement: 'Understand before composing.',
      detail:
        'I start from the real user journey and the business constraint, not from an isolated screen to reproduce.',
    },
    {
      statement: 'Make every state explicit.',
      detail:
        'Loading, empty, error and success are designed together: a forgotten state is a shipped bug.',
    },
    {
      statement: 'Measure before optimizing.',
      detail: 'Lighthouse and end-to-end tests decide, not intuition.',
    },
    {
      statement: 'Equip the team, not just the product.',
      detail:
        'Shared conventions, automated review and executable documentation: what holds up without me.',
    },
  ],
}

/** Keyed by URL, the same natural key the seed matches projects on. */
const projectDescriptionsEn: Record<string, string> = {
  'https://grimoire-game-frontend.vercel.app':
    'A web game built as a pnpm and Turborepo monorepo, designed as a proving ground for my team practices: .md-based agent configuration, automated review, Docker, commit hooks and continuous integration.',
  'https://ethswap-dapp.vercel.app':
    'A decentralized token-swap application on the Sepolia network: MetaMask connection, balance reading and transfers, with the Solidity contract written and deployed for it.',
  'https://fitapp-redux.vercel.app':
    'A workout tracker in Next.js and Redux: session building, state persistence, and an interface designed mobile-first.',
}

export { experiences, identity, identityEn, profile, profileEn, projectDescriptionsEn, projects }
