import { getPayload } from 'payload'

import { CONTENT_TAGS, cachedRead } from '@/lib/content-cache'
import config from '@payload-config'

import type { Locale } from '@/i18n/routing'

/**
 * Server-side access to the tag vocabulary.
 *
 * Read-only: tags are created through the Payload API, either from `/admin` or
 * from `/veille` itself. Near-duplicates ("React" / "react" / "ReactJS") are kept
 * out by the unique `slug`, not by restricting where creation happens.
 *
 * Cached under the bookmarks tag rather than one of its own: the two are always
 * displayed together on `/veille`, and the `tags` collection already purges that
 * tag on write, so a newly created tag reaches the selector immediately.
 */

/** Minimal shape the selector needs, decoupled from the Payload-generated types. */
interface TagView {
  id: string
  name: string
}

const readAllTags = async (locale: Locale): Promise<TagView[]> => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'tags',
    locale,
    sort: 'name',
    limit: 200,
    // Only the name is displayed: the relations are not needed here.
    depth: 0,
    overrideAccess: false,
  })

  return result.docs
    .map((doc) => ({
      id: String(doc.id),
      name: typeof doc.name === 'string' ? doc.name.trim() : '',
    }))
    .filter((tag) => tag.name !== '')
}

/**
 * Lists every existing tag, alphabetically.
 *
 * Unlike the filter row — which only shows tags actually carried by a link — this
 * returns the whole vocabulary: a freshly created tag has to be selectable, or it
 * could never be attached to anything.
 */
const listAllTags = cachedRead(CONTENT_TAGS.bookmarks, 'tags:list', readAllTags)

export { listAllTags, type TagView }
