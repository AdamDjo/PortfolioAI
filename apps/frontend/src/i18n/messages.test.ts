import { createTranslator } from 'next-intl'
import { describe, expect, it } from 'vitest'

import en from '../../messages/en.json'
import fr from '../../messages/fr.json'

import { routing } from './routing'

/**
 * English is the reference catalogue and types every `useTranslations` call, so
 * a key missing *there* already fails the type check. What types cannot see is
 * the other catalogues: `fr.json` is plain data, so a key left untranslated,
 * dropped, or holding a malformed ICU pattern would only surface at runtime —
 * as a raw key rendered on the page. These tests are that safety net.
 */

const CATALOGUES: Record<string, unknown> = { en, fr }

/** Every leaf value in a catalogue, keyed by its dotted path. */
function flatten(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value }

  const flat: Record<string, string> = {}
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      Object.assign(flat, flatten(child, prefix ? `${prefix}.${key}` : key))
    }
  }
  return flat
}

const reference = flatten(en)

describe('message catalogues', () => {
  it('covers every configured locale', () => {
    for (const locale of routing.locales) {
      expect(CATALOGUES[locale], `no catalogue for ${locale}`).toBeDefined()
    }
  })

  it.each(routing.locales.filter((locale) => locale !== routing.defaultLocale))(
    '%s has exactly the keys of the reference catalogue',
    (locale) => {
      const keys = Object.keys(flatten(CATALOGUES[locale]))
      expect(keys.sort()).toEqual(Object.keys(reference).sort())
    }
  )

  it.each(routing.locales)('%s has no blank message', (locale) => {
    for (const [key, value] of Object.entries(flatten(CATALOGUES[locale]))) {
      expect(value.trim(), `${locale}: ${key} is blank`).not.toBe('')
    }
  })

  // A malformed ICU pattern (an unclosed brace, a bad plural form) only fails
  // when the message is first rendered, which may well be in production. The
  // check goes through the same translator the app uses, so what passes here is
  // what the pages will format. `count` covers the plural messages; the others
  // ignore it.
  it.each(routing.locales)('%s formats as valid ICU', (locale) => {
    // The app's translator is typed to literal keys, which is the point of
    // `global.d.ts`; this test walks them dynamically, so it needs the loose
    // signature the runtime actually has.
    const t = createTranslator({
      locale,
      messages: CATALOGUES[locale] as Record<string, unknown>,
      onError: (error) => {
        throw error
      },
    }) as unknown as (key: string, values?: Record<string, unknown>) => string

    // Values for every placeholder used anywhere in the catalogue; a message
    // that takes none simply ignores them.
    const values = { count: 1, name: 'x', publisher: 'x', role: 'x', owner: 'x' }

    for (const key of Object.keys(reference)) {
      expect(() => t(key, values), `${locale}: ${key}`).not.toThrow()
    }
  })

  // An ICU placeholder is filled from code, so a locale that renamed or dropped
  // one would render an empty slot where a name belongs.
  //
  // Messages carrying a plural or select block are skipped: inside one, a branch
  // body (`one {Project}`) is written exactly like a placeholder, so telling them
  // apart needs the ICU AST rather than a pattern. Those messages are covered by
  // the formatting test above, and their argument is checked by the type system
  // at every call site.
  it.each(routing.locales.filter((locale) => locale !== routing.defaultLocale))(
    '%s keeps the placeholders of the reference catalogue',
    (locale) => {
      const isFormatted = (message: string) => /,\s*(plural|select|selectordinal)\s*,/.test(message)
      const placeholders = (message: string) =>
        [...message.matchAll(/\{\s*(\w+)\s*\}/g)].map((match) => match[1]).sort()

      for (const [key, value] of Object.entries(flatten(CATALOGUES[locale]))) {
        const source = reference[key]
        if (isFormatted(source) || isFormatted(value)) continue
        expect(placeholders(value), `${locale}: ${key}`).toEqual(placeholders(source))
      }
    }
  )

  it('translates rather than repeating the reference copy', () => {
    const french = flatten(fr)
    // Product names and labels legitimately match across locales; prose does not.
    for (const key of ['Nav.home', 'Home.hero.lead', 'Footer.legal', 'Privacy.title']) {
      expect(french[key], key).not.toBe(reference[key])
    }
  })
})
