import { getPayload } from 'payload'

import { CONTENT_TAGS, cachedRead } from '@/lib/content-cache'
import config from '@payload-config'

import type { Experience, Profile, Project, SiteIdentity } from '@/payload-types'

/**
 * Accès serveur au contenu du site : identité, profil, parcours, projets.
 *
 * Comme pour la veille, on interroge Payload en local (`getPayload`) : les pages
 * sont des composants serveur rendus dans le même processus, un aller-retour HTTP
 * vers sa propre API n'apporterait rien.
 *
 * Chaque lecture expose une forme minimale, découplée des types générés : la vue
 * ne doit pas avoir à connaître les `null` et les relations de Payload.
 *
 * Toutes sont mises en cache sous un tag invalidé à la publication : voir
 * `lib/content-cache.ts`. Les pages n'ont donc aucune configuration de cache à
 * déclarer — elles appellent ces fonctions et restent servies en statique.
 */

const asText = (value: string | null | undefined): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/** Nettoie un champ `hasMany` texte, dont les entrées peuvent être vides. */
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
   * Prénom seul, ou tout autre nom d'usage : c'est le nom montré sur le site.
   * L'identité légale complète vit dans `legal.publisher`, que seules les
   * mentions légales affichent.
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
 * Met une date au format « août 2025 ».
 *
 * Les dates sont saisies au mois près : le jour n'a aucun sens ici et n'est donc
 * pas affiché.
 */
const formatMonth = (value: string): string =>
  new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(value)
  )

/** « août 2025 — aujourd'hui » pour un poste en cours, sinon la période fermée. */
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
 * Résout l'URL du visuel téléversé.
 *
 * À profondeur 1 la relation contient le document média ; un identifiant nu
 * signifie qu'aucune image n'est exploitable et on retombe sur l'aperçu Open Graph.
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
 * Les lectures passent par le contrôle d'accès normal (`overrideAccess: false`) :
 * ce contenu est public par définition, donc aucune raison de le contourner.
 *
 * Chacune est enveloppée dans `cachedRead` : la fonction brute reste privée, seule
 * sa version mise en cache est exportée, afin qu'aucun appelant ne puisse
 * contourner le cache par mégarde.
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

/** Parcours du plus récent au plus ancien. */
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

/** Projets par ordre d'affichage croissant, les plus récents d'abord à égalité. */
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

const getIdentity = cachedRead(CONTENT_TAGS.identity, readIdentity)
const getProfile = cachedRead(CONTENT_TAGS.profile, readProfile)
const listExperiences = cachedRead(CONTENT_TAGS.experiences, readExperiences)
const listProjects = cachedRead(CONTENT_TAGS.projects, readProjects)

export {
  getIdentity,
  getProfile,
  listExperiences,
  listProjects,
  type ExperienceView,
  type ProjectView,
  type SkillGroupView,
}
