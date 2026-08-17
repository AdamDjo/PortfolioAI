import { canonicalizeUrl, deriveNameFromDomain } from './canonical-url'
import { fetchOpenGraphMetadata } from './open-graph'

import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Shared `beforeChange` hook: fills in a preview from the Open Graph tags of the
 * URL that was entered.
 *
 * Two collections depend on it (`projects` and `bookmarks`) and the expected
 * behaviour is identical: normalise the URL, fetch title/description/image once,
 * and never overwrite what was typed by hand. The hook is therefore parameterised
 * by field names rather than duplicated.
 */

/** Names of the fields the hook feeds in the calling collection. */
interface OpenGraphPreviewFields {
  /** Field holding the entered URL. It is rewritten in canonical form. */
  url: string
  /** Title field, filled in when left empty. */
  title: string
  /** Description field, filled in when left empty. */
  description?: string
  /** Field receiving the preview image URL. */
  imageUrl: string
  /** Field receiving the domain, useful for display and the favicon. */
  domain?: string
}

/**
 * Reads a form value as usable text.
 *
 * A field cleared from the admin arrives as an empty string, not as `null`, so it
 * is treated as absent in order to let the automatic value take over again.
 */
const readTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

/**
 * Builds the `beforeChange` hook for a collection described by its fields.
 *
 * The network call only happens when the URL is new or has changed: editing a tag
 * or a title alone does not trigger another outgoing request.
 */
const withOpenGraphPreview = (fields: OpenGraphPreviewFields): CollectionBeforeChangeHook => {
  return async ({ data, originalDoc, operation }) => {
    const record = data as Record<string, unknown>
    const raw = readTrimmedString(record[fields.url])
    if (!raw) return data

    const url = canonicalizeUrl(raw)
    // Unusable URL: field validation is left to produce the error rather than
    // writing a half-normalised value.
    if (!url) return data

    const domain = new URL(url).hostname
    const previous = originalDoc as Record<string, unknown> | undefined
    const previousUrl = readTrimmedString(previous?.[fields.url])

    // Nothing new about the URL: the preview already in the database is kept.
    if (operation !== 'create' && url === previousUrl) {
      return { ...data, [fields.url]: url }
    }

    const metadata = await fetchOpenGraphMetadata(url)

    const next: Record<string, unknown> = {
      ...record,
      [fields.url]: url,
      [fields.imageUrl]: metadata.imageUrl,
      // Hand-typed values are never overwritten. As a last resort, the name
      // derived from the domain stays more readable than the raw URL.
      [fields.title]:
        readTrimmedString(record[fields.title]) ?? metadata.title ?? deriveNameFromDomain(domain),
    }

    if (fields.description) {
      next[fields.description] =
        readTrimmedString(record[fields.description]) ?? metadata.description ?? undefined
    }

    if (fields.domain) {
      next[fields.domain] = domain
    }

    return next
  }
}

export { withOpenGraphPreview }
