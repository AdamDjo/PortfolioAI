import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { CONTENT_TAGS, PAGES_BY_TAG } from './content-cache'

/**
 * `revalidatePath` fails silently.
 *
 * It takes a plain string, returns nothing, and reports nothing when the path
 * matches no route: the call does nothing and the page keeps serving stale HTML
 * until the next deploy. Nothing in the type system ties these strings to the
 * routes on disk, so a renamed route breaks every entry here without an error —
 * as the move from `[lang]` to `[locale]` did.
 *
 * These tests are that missing link.
 */

const APP_DIR = join(import.meta.dirname, '..', 'app')

/** Mirrors what `purge` passes to `revalidatePath`. */
const toPattern = (path: string) => `/[locale]${path === '/' ? '' : path}`

/**
 * Where a route pattern lives on disk. Route groups are invisible in a URL, so
 * `/[locale]/projets` is served by `[locale]/(site)/projets`, and the home page
 * by a further `(home)`.
 */
const candidatesFor = (path: string, type: 'layout' | 'page') => {
  const file = type === 'layout' ? 'layout.tsx' : 'page.tsx'
  const base = join(APP_DIR, '[locale]')
  const rest = path === '/' ? '' : path

  return [
    join(base, rest, file),
    join(base, '(site)', rest, file),
    join(base, '(site)', rest, '(home)', file),
  ]
}

const ALL_ENTRIES = Object.values(PAGES_BY_TAG).flat()

describe('PAGES_BY_TAG', () => {
  it('lists an entry for every content tag', () => {
    expect(Object.keys(PAGES_BY_TAG).sort()).toEqual(Object.values(CONTENT_TAGS).sort())
  })

  it('points every entry at a route that exists on disk', () => {
    for (const { path, type } of ALL_ENTRIES) {
      const candidates = candidatesFor(path, type)
      expect(
        candidates.some((candidate) => existsSync(candidate)),
        `${path} (${type}) matches no route; tried:\n${candidates.join('\n')}`
      ).toBe(true)
    }
  })

  /*
   * Entries are bare app paths; `purge` adds the `[locale]` pattern. A locale
   * written here would produce `/[locale]/en/...`, and a hardcoded language
   * would refresh that one and leave the others stale.
   */
  it('stores paths without a locale', () => {
    for (const { path } of ALL_ENTRIES) {
      expect(path, `${path} must not carry a locale`).not.toMatch(/^\/(en|fr|\[locale\])(\/|$)/)
      expect(path.startsWith('/'), `${path} must be absolute`).toBe(true)
    }
  })

  /*
   * `revalidatePath` refreshes every language only when given a route pattern
   * *and* a type. A literal path plus a type refreshes nothing at all, silently
   * — the failure mode this pairing exists to prevent.
   */
  it('pairs a route pattern with a type', () => {
    for (const { path, type } of ALL_ENTRIES) {
      expect(toPattern(path)).toMatch(/^\/\[locale\]/)
      expect(type, `${path} needs a type`).toMatch(/^(page|layout)$/)
    }
  })

  it('builds the expected patterns', () => {
    expect(toPattern('/')).toBe('/[locale]')
    expect(toPattern('/projets')).toBe('/[locale]/projets')
  })
})
