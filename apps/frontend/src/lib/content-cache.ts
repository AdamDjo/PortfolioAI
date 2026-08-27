import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/routing'
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
  aiTools: 'content:ai-tools',
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
 *
 * Paths are stored bare (`/`, `/a-propos`); `purge` turns each into the route
 * pattern `/[locale]/…` before calling `revalidatePath`.
 *
 * The pattern is what makes this work across languages, and the rule is not
 * obvious: `revalidatePath` takes a *literal* path with no `type` to refresh one
 * page, or a *route pattern* with a `type` to refresh every page matching it.
 * Mixing them — a literal path plus a `type` — refreshes nothing, and nothing
 * reports it: the call returns void either way while the pages keep serving
 * stale HTML.
 *
 * Measured against a running production build: writing through the admin API
 * with the pattern form updates `/en` and `/fr` on the next request; with a
 * literal path plus `type`, neither ever updates.
 *
 * Locales are therefore never enumerated here — one pattern covers them all, so
 * adding a language needs no change.
 */

const PAGES_BY_TAG: Record<ContentTag, { path: string; type: 'layout' | 'page' }[]> = {
  [CONTENT_TAGS.identity]: [{ path: '/', type: 'layout' }],
  [CONTENT_TAGS.availability]: [{ path: '/', type: 'page' }],
  [CONTENT_TAGS.profile]: [{ path: '/a-propos', type: 'page' }],
  [CONTENT_TAGS.experiences]: [{ path: '/a-propos', type: 'page' }],
  [CONTENT_TAGS.projects]: [
    { path: '/', type: 'page' },
    { path: '/projets', type: 'page' },
  ],
  [CONTENT_TAGS.bookmarks]: [
    { path: '/', type: 'page' },
    { path: '/veille', type: 'page' },
  ],
  [CONTENT_TAGS.aiTools]: [{ path: '/outils-ia', type: 'page' }],
  // The assistant answers from a route handler, so no page holds this content:
  // purging the cache entry is enough, there is no HTML to replace.
  [CONTENT_TAGS.aiKnowledge]: [],
  [CONTENT_TAGS.assistant]: [],
}

/**
 * Caches a read under its tag, once per locale.
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
 * The locale is part of the cache key, not a detail: editorial fields now hold a
 * value per language, so a single shared entry would let whichever language was
 * requested first serve its content to the other.
 *
 * One memoized reader is built per locale and kept, rather than one per call: a
 * fresh `unstable_cache` on every invocation would defeat the cache it creates.
 *
 * The tag still earns its keep even though invalidation goes through paths: it
 * isolates cache entries from each other and spares `/veille`, rendered
 * dynamically, from replaying the query on every visit.
 */
const cachedRead = <T>(
  tag: ContentTag,
  key: string,
  read: (locale: Locale) => Promise<T>
): ((locale: Locale) => Promise<T>) => {
  const byLocale = new Map<Locale, () => Promise<T>>()

  return (locale) => {
    let cached = byLocale.get(locale)
    if (!cached) {
      cached = unstable_cache(() => read(locale), [key, locale], { tags: [tag], revalidate: false })
      byLocale.set(locale, cached)
    }
    return cached()
  }
}

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
    // Two purges, both needed. The cached reads carry `revalidate: false` and
    // now exist once per language, so replacing the HTML alone would re-render
    // the page against the very entry that went stale — and with a fallback in
    // play, a freshly written English value would keep showing French.
    // `expire: 0` drops the entries at once; the default profile only marks them
    // stale, which serves the old content one more time.
    revalidateTag(tag, { expire: 0 })

    for (const { path, type } of PAGES_BY_TAG[tag]) {
      revalidatePath(`/[locale]${path === '/' ? '' : path}`, type)
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
export { CONTENT_TAGS, PAGES_BY_TAG, cachedRead, revalidateCollection, revalidateGlobal }
