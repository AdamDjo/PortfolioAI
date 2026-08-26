import { describe, expect, it } from 'vitest'

import { DEFAULT_LOCALE, LOCALES, isLocale, localizePath } from './config'

describe('isLocale', () => {
  it('accepts every supported locale', () => {
    for (const locale of LOCALES) expect(isLocale(locale)).toBe(true)
  })

  it('rejects an unsupported language', () => {
    expect(isLocale('de')).toBe(false)
    expect(isLocale('EN')).toBe(false)
  })

  it('rejects values that are not strings', () => {
    expect(isLocale(undefined)).toBe(false)
    expect(isLocale(null)).toBe(false)
    expect(isLocale(2)).toBe(false)
  })
})

describe('localizePath', () => {
  it('prefixes a bare path', () => {
    expect(localizePath('fr', '/projets')).toBe('/fr/projets')
  })

  it('maps the root to the locale segment alone, with no trailing slash', () => {
    expect(localizePath('en', '/')).toBe('/en')
  })

  it('adds the missing leading slash', () => {
    expect(localizePath('en', 'contact')).toBe('/en/contact')
  })

  // Callers pass hrefs that may already be localized; prefixing twice would
  // produce /en/fr/projets and 404.
  it('leaves an already-localized path untouched', () => {
    expect(localizePath('en', '/fr/projets')).toBe('/fr/projets')
    expect(localizePath('fr', '/en')).toBe('/en')
  })

  // A path whose first segment merely starts with locale letters is not a
  // locale: /entreprise must not be mistaken for /en.
  it('does not mistake a longer segment for a locale', () => {
    expect(localizePath('fr', '/entreprise')).toBe('/fr/entreprise')
  })

  it('defaults to English, the fallback the site is written in', () => {
    expect(DEFAULT_LOCALE).toBe('en')
  })
})
