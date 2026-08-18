import { getPayload } from 'payload'

import { CONTENT_TAGS, cachedRead } from '@/lib/content-cache'
import config from '@payload-config'

/**
 * Server-side access to the tag vocabulary.
 *
 * Tags are created in `/admin` only, so this module just reads them: the site
 * offers them for selection but never adds to the list. That is what keeps
 * near-duplicates ("React" / "react" / "ReactJS") from piling up.
 *
 * Cached under the bookmarks tag rather than one of its own: the two are always
 * displayed together on `/veille`, and the `tags` collection already purges that
 * tag on write, so a tag created in the admin reaches the selector immediately.
 */

/** Minimal shape the selector needs, decoupled from the Payload-generated types. */
interface TagView {
  id: string
  name: string
}

const readAllTags = async (): Promise<TagView[]> => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'tags',
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
