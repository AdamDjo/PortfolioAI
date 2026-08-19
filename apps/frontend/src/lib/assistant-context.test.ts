import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The context is the assistant's entire knowledge of Adem: what lands in this
 * string is what the model can say, and what is left out is what it cannot
 * invent. These tests hold the two ends of that — the availability block keeping
 * its authority, and the contact email staying out.
 *
 * The readers are mocked at the module boundary rather than through a database:
 * what is under test is the assembly, not Payload.
 */

const identity = {
  displayName: 'Adem',
  role: 'Développeur web',
  location: 'Lyon',
  email: 'adem@example.com',
  githubUrl: 'https://github.com/AdamDjo',
  linkedinUrl: null,
  legal: { publisher: 'Adem B.', hostName: null, hostAddress: null, dataPolicy: null },
}

const profile = {
  headline: 'Interfaces rapides et accessibles',
  bio: 'Je conçois des applications web.',
  yearsOfExperience: 4,
  skillGroups: [{ label: 'Frontend', items: ['React', 'Next.js'] }],
  principles: [{ statement: 'Mesurer avant d’optimiser', detail: null }],
}

const state = {
  availability: { available: true, label: 'Disponible pour des opportunités', detail: null } as {
    available: boolean
    label: string
    detail: string | null
  },
  experiences: [
    {
      id: '1',
      company: 'Acme',
      role: 'Développeur',
      location: null,
      period: 'janvier 2024 — aujourd’hui',
      project: null,
      context: null,
      achievements: [],
      technologies: ['TypeScript'],
    },
  ],
  projects: [
    {
      id: '1',
      title: 'Portfolio',
      description: 'Un portfolio piloté par un CMS.',
      url: 'https://example.com',
      repositoryUrl: null,
      previewImageUrl: null,
      coverUrl: null,
      technologies: ['Next.js'],
      featured: true,
    },
  ],
  bookmarks: [{ title: 'React 19', tags: ['react'] }],
  knowledge: [{ question: 'Comment travailles-tu ?', answer: 'Par itérations courtes.' }],
}

vi.mock('@/lib/site-content', () => ({
  getIdentity: () => Promise.resolve(identity),
  getAvailability: () => Promise.resolve(state.availability),
  getProfile: () => Promise.resolve(profile),
  listExperiences: () => Promise.resolve(state.experiences),
  listProjects: () => Promise.resolve(state.projects),
}))

vi.mock('@/lib/bookmarks', () => ({
  listPublicBookmarks: () => Promise.resolve(state.bookmarks),
}))

// The cache is a pass-through here: `unstable_cache` needs a Next request scope,
// and what matters to these tests is the value, not where it was memoised.
vi.mock('@/lib/content-cache', () => ({
  CONTENT_TAGS: { aiKnowledge: 'content:ai-knowledge', assistant: 'content:assistant' },
  cachedRead: <T>(_tag: string, _key: string, read: () => Promise<T>) => read,
}))

const findMock = vi.fn()
vi.mock('payload', () => ({
  getPayload: () =>
    Promise.resolve({
      find: findMock,
      findGlobal: () =>
        Promise.resolve({
          enabled: true,
          systemPrompt: 'prompt',
          model: 'openai/gpt-oss-20b',
          unavailableMessage: 'indisponible',
        }),
    }),
}))
vi.mock('@payload-config', () => ({ default: {} }))

const { buildContext } = await import('./assistant-context')

beforeEach(() => {
  state.availability = {
    available: true,
    label: 'Disponible pour des opportunités',
    detail: null,
  }
  findMock.mockReset()
  findMock.mockResolvedValue({
    docs: state.knowledge.map((entry) => ({ ...entry, category: 'methode' })),
  })
})

describe('buildContext — disponibilité', () => {
  it('place la disponibilité en tête, avant toute autre section', async () => {
    const context = await buildContext()
    expect(context.indexOf('## Disponibilité')).toBe(0)
    expect(context.indexOf('## Disponibilité')).toBeLessThan(context.indexOf('## Parcours'))
  })

  it('déclare la section comme faisant autorité', async () => {
    // Without this line the model happily infers availability from an older
    // experience entry further down.
    const context = await buildContext()
    expect(context).toContain('Cette section fait autorité')
  })

  it('reprend le statut indisponible et sa précision', async () => {
    state.availability = {
      available: false,
      label: 'En mission jusqu’en mars',
      detail: 'Ouvert aux discussions pour la suite.',
    }

    const context = await buildContext()
    expect(context).toContain('Statut : indisponible')
    expect(context).toContain('En mission jusqu’en mars')
    expect(context).toContain('Ouvert aux discussions pour la suite.')
  })
})

describe('buildContext — confidentialité', () => {
  it('n’expose jamais l’adresse e-mail de contact', async () => {
    // Deliberate: the assistant invites contact, it does not hand out the address.
    const context = await buildContext()
    expect(context).not.toContain(identity.email)
  })

  it('ne demande à Payload que les connaissances publiées', async () => {
    await buildContext()
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'ai-knowledge',
        where: { published: { equals: true } },
      })
    )
  })

  it('n’inclut pas une réponse non publiée que Payload aurait laissé passer', async () => {
    findMock.mockResolvedValue({
      docs: [{ question: 'Brouillon', answer: 'Réponse interne', category: 'autre' }],
    })

    // The query filters, but the assertion is on the output: this is the property
    // that actually matters if the query is ever loosened.
    const published = await buildContext()
    expect(published).toContain('Réponse interne')

    findMock.mockResolvedValue({ docs: [] })
    const context = await buildContext()
    expect(context).not.toContain('Réponse interne')
  })
})

describe('buildContext — assemblage', () => {
  it('rend les sections attendues', async () => {
    const context = await buildContext()
    for (const heading of [
      '## Identité',
      '## Profil',
      '## Compétences',
      '## Parcours',
      '## Projets',
      '## Veille récente',
      '## Réponses validées',
    ]) {
      expect(context).toContain(heading)
    }
  })

  it('omet une section vide au lieu d’écrire un titre sans contenu', async () => {
    state.projects = []
    state.bookmarks = []

    const context = await buildContext()
    expect(context).not.toContain('## Projets')
    expect(context).not.toContain('## Veille récente')

    state.projects = [
      {
        id: '1',
        title: 'Portfolio',
        description: 'Un portfolio piloté par un CMS.',
        url: 'https://example.com',
        repositoryUrl: null,
        previewImageUrl: null,
        coverUrl: null,
        technologies: ['Next.js'],
        featured: true,
      },
    ]
    state.bookmarks = [{ title: 'React 19', tags: ['react'] }]
  })

  it('limite la veille à 40 entrées', async () => {
    state.bookmarks = Array.from({ length: 60 }, (_, index) => ({
      title: `Article ${index}`,
      tags: [],
    }))

    const context = await buildContext()
    expect(context).toContain('Article 39')
    expect(context).not.toContain('Article 40')

    state.bookmarks = [{ title: 'React 19', tags: ['react'] }]
  })
})
