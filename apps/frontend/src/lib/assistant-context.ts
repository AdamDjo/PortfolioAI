import { getPayload } from 'payload'

import { listPublicBookmarks } from '@/lib/bookmarks'
import { CONTENT_TAGS, cachedRead } from '@/lib/content-cache'
import {
  getAvailability,
  getIdentity,
  getProfile,
  listExperiences,
  listProjects,
} from '@/lib/site-content'
import config from '@payload-config'

import type { AiKnowledge, AssistantSetting } from '@/payload-types'

/**
 * Builds the context handed to the model.
 *
 * The whole context is assembled from the same cached readers the pages use, so
 * the assistant can never contradict what a visitor sees — availability above
 * all, which #7 made a single source of truth.
 *
 * The guiding rule is that everything reaching this string is already public,
 * with one deliberate exception: `ai-knowledge`, private in the API and included
 * here because generated prose is precisely what it exists for. Anything else
 * that is not on a page has no business being here.
 */

interface AssistantConfig {
  enabled: boolean
  systemPrompt: string
  model: string
  unavailableMessage: string
  retentionNotice: string
}

interface KnowledgeEntry {
  question: string
  answer: string
  category: string
}

const toConfig = (doc: AssistantSetting): AssistantConfig => ({
  enabled: Boolean(doc.enabled),
  systemPrompt: doc.systemPrompt,
  model: doc.model,
  unavailableMessage: doc.unavailableMessage,
  retentionNotice: doc.retentionNotice,
})

/**
 * Reads the curated answers.
 *
 * `overrideAccess: true` is required and safe: the collection denies public
 * reads, and this runs on the server with no visitor identity attached. Access
 * control protects the API surface; here the entries never leave as data.
 *
 * `published` is enforced in the query rather than in a filter afterwards, so an
 * unpublished entry is never even loaded into memory.
 */
const readKnowledge = async (): Promise<KnowledgeEntry[]> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'ai-knowledge',
    where: { published: { equals: true } },
    sort: 'category',
    limit: 200,
    overrideAccess: true,
  })

  return result.docs.map((doc: AiKnowledge) => ({
    question: doc.question,
    answer: doc.answer,
    category: doc.category ?? 'autre',
  }))
}

const readAssistantConfig = async (): Promise<AssistantConfig> => {
  const payload = await getPayload({ config })
  const doc = await payload.findGlobal({ slug: 'assistant-settings', overrideAccess: true })
  return toConfig(doc)
}

const getKnowledge = cachedRead(CONTENT_TAGS.aiKnowledge, 'ai-knowledge:published', readKnowledge)
const getAssistantConfig = cachedRead(
  CONTENT_TAGS.assistant,
  'assistant:config',
  readAssistantConfig
)

/** Renders a section only when it has content, so the model never reads empty headings. */
const section = (title: string, body: string): string =>
  body.trim() ? `## ${title}\n${body}\n` : ''

const list = (items: string[]): string => items.map((item) => `- ${item}`).join('\n')

/**
 * Assembles the context document.
 *
 * Markdown because it is what these models are trained on, and because the
 * headings give the model something to cite implicitly when it answers.
 */
const buildContext = async (): Promise<string> => {
  const [identity, availability, profile, experiences, projects, bookmarks, knowledge] =
    await Promise.all([
      getIdentity(),
      getAvailability(),
      getProfile(),
      listExperiences(),
      listProjects(),
      listPublicBookmarks(),
      getKnowledge(),
    ])

  // Availability comes first and is stated as authoritative: it is the one fact
  // the model must never paraphrase from older content further down.
  const availabilityBlock = [
    `Statut : ${availability.available ? 'disponible' : 'indisponible'}`,
    `Formulation affichée sur le site : « ${availability.label} »`,
    availability.detail ? `Précision : ${availability.detail}` : null,
    'Cette section fait autorité sur toute question de disponibilité.',
  ]
    .filter(Boolean)
    .join('\n')

  const identityBlock = [
    `Prénom : ${identity.displayName}`,
    `Métier : ${identity.role}`,
    identity.location ? `Localisation : ${identity.location}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const profileBlock = [
    profile.headline,
    '',
    profile.bio,
    profile.yearsOfExperience ? `\nAnnées d’expérience : ${profile.yearsOfExperience}` : '',
  ].join('\n')

  const skillsBlock = list(
    profile.skillGroups.map((group) => `${group.label} : ${group.items.join(', ')}`)
  )

  const principlesBlock = list(
    profile.principles.map((principle) =>
      principle.detail ? `${principle.statement} — ${principle.detail}` : principle.statement
    )
  )

  const experiencesBlock = experiences
    .map((entry) => {
      const lines = [
        `### ${entry.role} — ${entry.company} (${entry.period})`,
        entry.location ? `Lieu : ${entry.location}` : null,
        entry.context,
        entry.achievements.length ? list(entry.achievements) : null,
        entry.technologies.length ? `Technologies : ${entry.technologies.join(', ')}` : null,
      ]
      return lines.filter(Boolean).join('\n')
    })
    .join('\n\n')

  const projectsBlock = projects
    .map((project) => {
      const lines = [
        `### ${project.title}`,
        project.description,
        project.technologies.length ? `Technologies : ${project.technologies.join(', ')}` : null,
        `Lien : ${project.url}`,
      ]
      return lines.filter(Boolean).join('\n')
    })
    .join('\n\n')

  // Titles and tags only: the veille is a reading list, and the model has no use
  // for the descriptions beyond knowing what Adem follows.
  const bookmarksBlock = list(
    bookmarks
      .slice(0, 40)
      .map((entry) =>
        entry.tags.length ? `${entry.title} (${entry.tags.join(', ')})` : entry.title
      )
  )

  const knowledgeBlock = knowledge
    .map((entry) => `### ${entry.question}\n${entry.answer}`)
    .join('\n\n')

  return [
    section('Disponibilité', availabilityBlock),
    section('Identité', identityBlock),
    section('Profil', profileBlock),
    section('Compétences', skillsBlock),
    section('Principes de travail', principlesBlock),
    section('Parcours', experiencesBlock),
    section('Projets', projectsBlock),
    section('Veille récente', bookmarksBlock),
    section('Réponses validées', knowledgeBlock),
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * The contact email is deliberately absent from every block above.
 *
 * It sits in `SiteIdentity` next to the fields that are used, so leaving it out
 * has to be a decision rather than an oversight: the site shows it behind its own
 * page, and an assistant that recites it on request turns the portfolio into an
 * address harvester. The model is told to invite contact, not to hand out the
 * address.
 */

/**
 * `buildContext` is intentionally not wrapped in a `cachedRead` of its own.
 *
 * It composes seven readers that are each already cached under their own tag, so
 * the work per call is string assembly over warm data. A cache on top would need
 * a tag purged by all seven collections at once; under any single tag — editing a
 * project, say — it would keep serving a context the pages have already moved
 * past, and the assistant would contradict the site.
 */
export { buildContext, getAssistantConfig, type AssistantConfig }
