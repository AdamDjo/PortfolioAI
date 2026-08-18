import { getPayload } from 'payload'

import { CONTENT_TAGS, cachedRead } from '@/lib/content-cache'
import config from '@payload-config'

import type { Experience, Profile, Project, SiteIdentity } from '@/payload-types'

/**
 * Server-side access to the site content: identity, profile, career, projects.
 *
 * Payload is queried locally through `getPayload`, as the veille reads do: the
 * pages are server components rendered in this same process, so an HTTP round
 * trip to our own API would buy nothing.
 *
 * Each read exposes a minimal shape decoupled from the generated types, so views
 * never have to know about Payload's `null`s and relations. All of them are
 * cached under a tag invalidated on publish — see `lib/content-cache.ts`, which
 * is why no page declares any cache config of its own.
 */

const asText = (value: string | null | undefined): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/** Cleans a text `hasMany` field, whose entries can be empty. */
const asTextList = (value: (string | null)[] | null | undefined): string[] => {
  if (!value) return []

  const items: string[] = []
  for (const entry of value) {
    const text = asText(entry)
    if (text) items.push(text)
  }
  return items
}

interface IdentityView {
  /**
   * First name alone, or any other everyday name: this is what the site shows.
   * The full legal identity lives in `legal.publisher`, displayed only by the
   * legal notice.
   */
  displayName: string
  role: string
  location: string | null
  email: string
  githubUrl: string | null
  linkedinUrl: string | null
  legal: {
    publisher: string | null
    hostName: string | null
    hostAddress: string | null
    dataPolicy: string | null
  }
}

interface SkillGroupView {
  label: string
  items: string[]
}

interface PrincipleView {
  statement: string
  detail: string | null
}

interface ProfileView {
  headline: string
  bio: string
  yearsOfExperience: number | null
  skillGroups: SkillGroupView[]
  principles: PrincipleView[]
}

interface ExperienceView {
  id: string
  company: string
  role: string
  location: string | null
  period: string
  project: string | null
  context: string | null
  achievements: string[]
  technologies: string[]
}

interface ProjectView {
  id: string
  title: string
  description: string | null
  url: string
  repositoryUrl: string | null
  previewImageUrl: string | null
  coverUrl: string | null
  technologies: string[]
  featured: boolean
}

const toIdentityView = (doc: SiteIdentity): IdentityView => ({
  displayName: doc.contact.displayName,
  role: doc.contact.role,
  location: asText(doc.contact.location),
  email: doc.contact.email,
  githubUrl: asText(doc.social?.githubUrl),
  linkedinUrl: asText(doc.social?.linkedinUrl),
  legal: {
    publisher: asText(doc.legal?.publisher),
    hostName: asText(doc.legal?.hostName),
    hostAddress: asText(doc.legal?.hostAddress),
    dataPolicy: asText(doc.legal?.dataPolicy),
  },
})

const toProfileView = (doc: Profile): ProfileView => ({
  headline: doc.headline,
  bio: doc.bio,
  yearsOfExperience: typeof doc.yearsOfExperience === 'number' ? doc.yearsOfExperience : null,
  skillGroups: (doc.skillGroups ?? []).map((group) => ({
    label: group.label,
    items: asTextList(group.items),
  })),
  principles: (doc.principles ?? []).map((principle) => ({
    statement: principle.statement,
    detail: asText(principle.detail),
  })),
})

/**
 * Formats a date as "août 2025".
 *
 * Dates are entered to the month: the day carries no meaning here, so it is not
 * displayed.
 */
const formatMonth = (value: string): string =>
  new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(value)
  )

/** "août 2025 — aujourd’hui" for a current role, otherwise the closed period. */
const formatPeriod = (doc: Experience): string => {
  const start = formatMonth(doc.startDate)
  if (doc.current) return `${start} — aujourd’hui`

  const end = asText(doc.endDate)
  return end ? `${start} — ${formatMonth(end)}` : start
}

const toExperienceView = (doc: Experience): ExperienceView => ({
  id: String(doc.id),
  company: doc.company,
  role: doc.role,
  location: asText(doc.location),
  period: formatPeriod(doc),
  project: asText(doc.project),
  context: asText(doc.context),
  achievements: (doc.achievements ?? []).map((entry) => entry.statement),
  technologies: asTextList(doc.technologies),
})

/**
 * Resolves the URL of the uploaded visual.
 *
 * At depth 1 the relation holds the media document; a bare id means no usable
 * image, and the Open Graph preview takes over.
 */
const readCoverUrl = (cover: Project['cover']): string | null => {
  if (!cover || typeof cover === 'number') return null
  return asText(cover.url)
}

const toProjectView = (doc: Project): ProjectView => ({
  id: String(doc.id),
  title: asText(doc.title) ?? doc.url,
  description: asText(doc.description),
  url: doc.url,
  repositoryUrl: asText(doc.repositoryUrl),
  previewImageUrl: asText(doc.previewImageUrl),
  coverUrl: readCoverUrl(doc.cover),
  technologies: asTextList(doc.technologies),
  featured: Boolean(doc.featured),
})

/**
 * Reads go through normal access control (`overrideAccess: false`): this content
 * is public by definition, so there is no reason to bypass it.
 *
 * Each raw read stays private and only its `cachedRead` wrapper is exported, so
 * no caller can sidestep the cache by accident.
 */
const readIdentity = async (): Promise<IdentityView> => {
  const payload = await getPayload({ config })
  const doc = await payload.findGlobal({ slug: 'site-identity', overrideAccess: false })
  return toIdentityView(doc)
}

const readProfile = async (): Promise<ProfileView> => {
  const payload = await getPayload({ config })
  const doc = await payload.findGlobal({ slug: 'profile', overrideAccess: false })
  return toProfileView(doc)
}

/** Career path, most recent first. */
const readExperiences = async (): Promise<ExperienceView[]> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'experiences',
    sort: '-startDate',
    limit: 50,
    overrideAccess: false,
  })
  return result.docs.map(toExperienceView)
}

/** Projects by ascending display order, most recent first on a tie. */
const readProjects = async (): Promise<ProjectView[]> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'projects',
    sort: ['order', '-createdAt'],
    limit: 50,
    depth: 1,
    overrideAccess: false,
  })
  return result.docs.map(toProjectView)
}

const getIdentity = cachedRead(CONTENT_TAGS.identity, 'identity', readIdentity)
const getProfile = cachedRead(CONTENT_TAGS.profile, 'profile', readProfile)
const listExperiences = cachedRead(CONTENT_TAGS.experiences, 'experiences', readExperiences)
const listProjects = cachedRead(CONTENT_TAGS.projects, 'projects', readProjects)

export {
  getIdentity,
  getProfile,
  listExperiences,
  listProjects,
  type ExperienceView,
  type ProjectView,
  type SkillGroupView,
}
