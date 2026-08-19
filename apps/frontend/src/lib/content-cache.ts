import { revalidatePath, unstable_cache } from 'next/cache'

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Server-side cache for editorial content, invalidated on publish.
 *
 * Reads are cached and Payload hooks invalidate the affected pages as soon as a
 * document changes: pages stay static, the database is queried only after a
 * write, and the site is up to date immediately. A plain `revalidate` would
 * leave a fix published in `/admin` invisible until the delay expired.
 *
 * The cache lives here, in the data layer, rather than duplicated as segment
 * config in every page.
 */

/**
 * One tag per kind of content rather than a single global one: editing a project
 * must not force the career path or the legal notice to be read again.
 */
const CONTENT_TAGS = {
  identity: 'content:identity',
  availability: 'content:availability',
  profile: 'content:profile',
  experiences: 'content:experiences',
  projects: 'content:projects',
  bookmarks: 'content:bookmarks',
  aiKnowledge: 'content:ai-knowledge',
  assistant: 'content:assistant',
} as const

type ContentTag = (typeof CONTENT_TAGS)[keyof typeof CONTENT_TAGS]

/**
 * Pages to regenerate for each kind of content.
 *
 * Invalidation targets pages, not the data cache: a page fully prerendered at
 * build time has no revalidation deadline, so marking its data stale never
 * triggers a re-render — only `revalidatePath` replaces its HTML. Verified in
 * production: purging the tag left the page serving stale content indefinitely.
 *
 * Identity feeds the header and footer defined in the shared layout, so every
 * page depends on it — hence the root invalidated in `layout` mode.
 */
const PAGES_BY_TAG: Record<ContentTag, { path: string; type?: 'layout' | 'page' }[]> = {
  [CONTENT_TAGS.identity]: [{ path: '/', type: 'layout' }],
  [CONTENT_TAGS.availability]: [{ path: '/' }],
  [CONTENT_TAGS.profile]: [{ path: '/a-propos' }],
  [CONTENT_TAGS.experiences]: [{ path: '/a-propos' }],
  [CONTENT_TAGS.projects]: [{ path: '/' }, { path: '/projets' }],
  [CONTENT_TAGS.bookmarks]: [{ path: '/' }, { path: '/veille' }],
  // The assistant answers from a route handler, so no page holds this content:
  // purging the cache entry is enough, there is no HTML to replace.
  [CONTENT_TAGS.aiKnowledge]: [],
  [CONTENT_TAGS.assistant]: [],
}

/**
 * Caches a read under its tag.
 *
 * `revalidate: false` because invalidation comes from the hooks, not from a
 * clock: a periodic refresh would only hit the database for nothing.
 *
 * `key` identifies the cache entry and must be unique across all reads, while
 * `tag` decides what invalidates it. They are separate because several reads can
 * legitimately share one tag — bookmarks and the tag vocabulary are always shown
 * together and are purged together, but each needs its own entry. Passing the tag
 * as the key too would make the second read overwrite the first.
 *
 * The tag still earns its keep even though invalidation goes through paths: it
 * isolates cache entries from each other and spares `/veille`, rendered
 * dynamically, from replaying the query on every visit.
 */
const cachedRead = <T>(tag: ContentTag, key: string, read: () => Promise<T>): (() => Promise<T>) =>
  unstable_cache(read, [key], { tags: [tag], revalidate: false })

/**
 * Regenerates the pages that display this content.
 *
 * `revalidatePath` needs a Next request context and throws outside one, but
 * these hooks also run outside the web server: `pnpm seed`, a migration or any
 * script started by `payload run` writes to the same collections. Without this
 * guard the write would fail in a CLI process, where there is precisely no page
 * to regenerate. Only that one error is swallowed, so a genuine server-side
 * failure still surfaces.
 */
const purge = (tag: ContentTag): void => {
  try {
    for (const { path, type } of PAGES_BY_TAG[tag]) {
      revalidatePath(path, type)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (!message.includes('static generation store missing')) throw error
  }
}

/**
 * Global `afterChange` hook: regenerates the pages once a save lands.
 *
 * `afterChange` rather than `beforeChange` so invalidation happens only after
 * the write actually reached the database — a failed validation would otherwise
 * regenerate the pages for nothing.
 *
 * Nothing is returned: Payload replaces the document when a hook returns a
 * value, and invalidating a cache has no business modifying it.
 */
const revalidateGlobal = (tag: ContentTag): GlobalAfterChangeHook => {
  return () => {
    purge(tag)
  }
}

/** Same idea for a collection: create, update and delete. */
const revalidateCollection = (
  tag: ContentTag
): { afterChange: CollectionAfterChangeHook; afterDelete: CollectionAfterDeleteHook } => ({
  afterChange: () => {
    purge(tag)
  },
  afterDelete: () => {
    purge(tag)
  },
})

/**
 * `ContentTag` stays unexported: callers pass a `CONTENT_TAGS` value, whose type
 * is inferred anyway. Exporting it would invite declaring a tag elsewhere, while
 * the list has to stay defined here.
 */
export { CONTENT_TAGS, cachedRead, revalidateCollection, revalidateGlobal }
