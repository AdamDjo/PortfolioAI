import { getPayload } from 'payload'

import config from '@payload-config'

import type { Bookmark } from '@/payload-types'

/**
 * Accès serveur aux liens de veille.
 *
 * On interroge Payload en local (`getPayload`) plutôt que par HTTP : la page est un
 * composant serveur rendu dans le même processus, un aller-retour réseau vers sa
 * propre API n'apporterait rien.
 */

/** Forme minimale dont la vue a besoin, découplée des types générés par Payload. */
interface BookmarkView {
  id: string
  url: string
  domain: string
  title: string
  description: string | null
  previewImageUrl: string | null
  tags: string[]
}

const asText = (value: string | null | undefined): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Extrait les noms de tags d'une relation Payload.
 *
 * Selon la profondeur de la requête, la relation contient soit des identifiants,
 * soit les documents complets. Ici la profondeur vaut 1, donc on attend des objets
 * et on ignore les identifiants nus.
 */
const readTagNames = (relation: Bookmark['tags']): string[] => {
  if (!relation) return []

  const names: string[] = []
  for (const entry of relation) {
    if (typeof entry === 'number') continue
    const name = asText(entry.name)
    if (name) names.push(name)
  }
  return names
}

/** Domaine stocké, ou déduit de l'URL si le champ automatique est vide. */
const readDomain = (doc: Bookmark): string => {
  const stored = asText(doc.domain)
  if (stored) return stored

  try {
    return new URL(doc.url).hostname
  } catch {
    return ''
  }
}

const toView = (doc: Bookmark): BookmarkView => {
  const domain = readDomain(doc)

  return {
    id: String(doc.id),
    url: doc.url,
    domain,
    title: asText(doc.title) ?? domain,
    description: asText(doc.description),
    previewImageUrl: asText(doc.previewImageUrl),
    tags: readTagNames(doc.tags),
  }
}

/**
 * Liste les liens visibles sur le site, du plus récent au plus ancien.
 *
 * Les liens décochés (`active: false`) sont exclus ici, et non filtrés dans la
 * vue : ils ne doivent pas être envoyés au navigateur du tout.
 */
const listPublicBookmarks = async (): Promise<BookmarkView[]> => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'bookmarks',
    where: { active: { equals: true } },
    sort: '-createdAt',
    limit: 200,
    depth: 1,
    // On passe par le contrôle d'accès normal : la lecture est publique, donc
    // aucune raison de le contourner depuis le rendu serveur.
    overrideAccess: false,
  })

  return result.docs.map(toView)
}

export { listPublicBookmarks, type BookmarkView }
