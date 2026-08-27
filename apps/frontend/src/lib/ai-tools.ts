import { getPayload } from 'payload'

import { CONTENT_TAGS, cachedRead } from '@/lib/content-cache'
import config from '@payload-config'

import type { Locale } from '@/i18n/routing'
import type { AiTool } from '@/payload-types'

/**
 * Server-side access to the AI tooling list.
 *
 * Same shape as `lib/bookmarks.ts`: Payload is queried locally from the server
 * component, and the read is cached under a tag purged on write.
 */

/** Derived from the collection rather than restated: Payload owns this union. */
type AIToolKind = AiTool['kind']

/** Minimal shape the view needs, decoupled from the Payload-generated types. */
interface AIToolView {
  id: string
  name: string
  kind: AIToolKind
  description: string | null
  /** The text behind the copy button — the reason the page exists. */
  snippet: string
  url: string | null
  /**
   * True when the snippet spans several lines, which is what separates a config
   * block from a one-line install command. The view renders them differently and
   * this is the only signal it needs, so the distinction is computed once here
   * rather than re-derived in the browser.
   */
  multiline: boolean
}

const asText = (value: string | null | undefined): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

const toView = (doc: AiTool): AIToolView => {
  const snippet = (doc.snippet ?? '').trim()

  return {
    id: String(doc.id),
    name: doc.name,
    kind: doc.kind,
    description: asText(doc.description),
    snippet,
    url: asText(doc.url),
    multiline: snippet.includes('\n'),
  }
}

/**
 * Lists the tools visible on the site, grouped by kind at render time.
 *
 * Sorted by name rather than by creation date: unlike a veille feed, this list is
 * a reference one comes back to, so a stable alphabetical order is easier to scan
 * than a shifting "most recent first".
 */
const readPublicAITools = async (locale: Locale): Promise<AIToolView[]> => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'ai-tools',
    locale,
    where: { active: { equals: true } },
    sort: 'name',
    limit: 200,
    depth: 0,
    overrideAccess: false,
  })

  return result.docs.map(toView)
}

const listPublicAITools = cachedRead(CONTENT_TAGS.aiTools, 'ai-tools:list', readPublicAITools)

export { listPublicAITools, type AIToolKind, type AIToolView }
