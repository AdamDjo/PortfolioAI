import { getPayload } from 'payload'

import { CONTENT_TAGS, cachedRead } from '@/lib/content-cache'
import config from '@payload-config'

import type { Bookmark } from '@/payload-types'

/**
 * Server-side access to the veille links.
 *
 * Payload is queried locally (`getPayload`) rather than over HTTP: the page is a
 * server component rendered in the same process, so a network round trip to its
 * own API would buy nothing.
 *
 * The read is cached under a tag purged on write (see `lib/content-cache.ts`):
 * the list is public and identical for everyone, so it does not have to be
 * recomputed on every visit. It stays immediately up to date after an addition
 * from `/veille`.
 */

/** Minimal shape the view needs, decoupled from the Payload-generated types. */
interface BookmarkView {
  id: string
  url: string
  domain: string
  title: string
  description: string | null
  previewImageUrl: string | null
  tags: string[]
  /** Relation identifiers, needed by the owner-only tag editor to know what is checked. */
  tagIds: string[]
}

const asText = (value: string | null | undefined): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Extracts tag names and identifiers from a Payload relation.
 *
 * Depending on the query depth, the relation holds either identifiers or the full
 * documents. Depth is 1 here, so objects are expected and bare identifiers are
 * ignored.
 */
const readTags = (relation: Bookmark['tags']): { names: string[]; ids: string[] } => {
  if (!relation) return { names: [], ids: [] }

  const names: string[] = []
  const ids: string[] = []
  for (const entry of relation) {
    if (typeof entry === 'number') continue
    const name = asText(entry.name)
    if (!name) continue
    names.push(name)
    ids.push(String(entry.id))
  }
  return { names, ids }
}

/** Stored domain, or derived from the URL when the automatic field is empty. */
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
  const { names, ids } = readTags(doc.tags)

  return {
    id: String(doc.id),
    url: doc.url,
    domain,
    title: asText(doc.title) ?? domain,
    description: asText(doc.description),
    previewImageUrl: asText(doc.previewImageUrl),
    tags: names,
    tagIds: ids,
  }
}

/**
 * Lists the links visible on the site, most recent first.
 *
 * Unchecked links (`active: false`) are excluded here rather than filtered in the
 * view: they must not reach the browser at all.
 */
const readPublicBookmarks = async (): Promise<BookmarkView[]> => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'bookmarks',
    where: { active: { equals: true } },
    sort: '-createdAt',
    limit: 200,
    depth: 1,
    // Normal access control applies: reading is public, so there is no reason to
    // bypass it from server rendering.
    overrideAccess: false,
  })

  return result.docs.map(toView)
}

const listPublicBookmarks = cachedRead(
  CONTENT_TAGS.bookmarks,
  'bookmarks:list',
  readPublicBookmarks
)

export { listPublicBookmarks, type BookmarkView }
