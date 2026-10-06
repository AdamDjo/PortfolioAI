import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { CONTENT_TAGS, PAGES_BY_TAG, toRoutePattern } from './content-cache'

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

/**
 * The file a route pattern names. Next matches `revalidatePath` against the
 * route as it sits on disk, route groups included, so the pattern has to lead
 * to this exact file — a group left out matches nothing.
 */
const fileFor = (path: string, type: 'layout' | 'page') =>
  join(APP_DIR, toRoutePattern(path, type), type === 'layout' ? 'layout.tsx' : 'page.tsx')

const ALL_ENTRIES = Object.values(PAGES_BY_TAG).flat()

describe('PAGES_BY_TAG', () => {
  it('lists an entry for every content tag', () => {
    expect(Object.keys(PAGES_BY_TAG).sort()).toEqual(Object.values(CONTENT_TAGS).sort())
  })

  it('points every entry at the exact route file on disk', () => {
    for (const { path, type } of ALL_ENTRIES) {
      const file = fileFor(path, type)
      expect(existsSync(file), `${path} (${type}) matches no route: ${file}`).toBe(true)
    }
  })

  /*
   * Entries are bare app paths; `toRoutePattern` adds the `[locale]` pattern. A locale
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
      expect(toRoutePattern(path, type)).toMatch(/^\/\[locale\]/)
      expect(type, `${path} needs a type`).toMatch(/^(page|layout)$/)
    }
  })

  it('builds the expected patterns, route groups included', () => {
    expect(toRoutePattern('/', 'layout')).toBe('/[locale]')
    expect(toRoutePattern('/', 'page')).toBe('/[locale]/(site)/(home)')
    expect(toRoutePattern('/blog/[slug]', 'page')).toBe('/[locale]/(site)/blog/[slug]')
  })
})
