import { describe, expect, it } from 'vitest'

import { canonicalizeUrl, deriveNameFromDomain, extractDomain } from './canonical-url'

/**
 * The canonical form is the uniqueness key in the database: these tests pin down
 * both what must count as a duplicate and, just as importantly, what must stay
 * distinct.
 */
describe('canonicalizeUrl', () => {
  it('complète un schéma absent', () => {
    expect(canonicalizeUrl('react.dev')).toBe('https://react.dev/')
  })

  it('retire le www de tête et met l’hôte en minuscules', () => {
    expect(canonicalizeUrl('https://WWW.React.dev/')).toBe('https://react.dev/')
  })

  it('retire le fragment', () => {
    expect(canonicalizeUrl('https://react.dev/learn#state')).toBe('https://react.dev/learn')
  })

  it('retire la barre oblique finale mais garde celle de la racine', () => {
    expect(canonicalizeUrl('https://react.dev/learn/')).toBe('https://react.dev/learn')
    expect(canonicalizeUrl('https://react.dev')).toBe('https://react.dev/')
  })

  it('supprime les identifiants intégrés à l’URL', () => {
    expect(canonicalizeUrl('https://user:pass@react.dev/learn')).toBe('https://react.dev/learn')
  })

  it.each([
    ['utm_source', 'https://react.dev/learn?utm_source=newsletter'],
    ['utm_campaign', 'https://react.dev/learn?utm_campaign=launch&utm_medium=email'],
    ['fbclid', 'https://react.dev/learn?fbclid=abc123'],
    ['gclid', 'https://react.dev/learn?gclid=abc123'],
    ['matomo pk_', 'https://react.dev/learn?pk_campaign=x'],
  ])('retire les paramètres de suivi : %s', (_label, input) => {
    expect(canonicalizeUrl(input)).toBe('https://react.dev/learn')
  })

  it('conserve les paramètres porteurs de sens', () => {
    expect(canonicalizeUrl('https://youtube.com/watch?v=abc&utm_source=x')).toBe(
      'https://youtube.com/watch?v=abc'
    )
  })

  it('rend l’ordre des paramètres non significatif', () => {
    expect(canonicalizeUrl('https://example.com/p?b=2&a=1')).toBe(
      canonicalizeUrl('https://example.com/p?a=1&b=2')
    )
  })

  it('garde deux chemins distincts distincts', () => {
    expect(canonicalizeUrl('https://react.dev/learn')).not.toBe(
      canonicalizeUrl('https://react.dev/reference')
    )
  })

  it('garde un sous-domaine distinct du domaine racine', () => {
    expect(canonicalizeUrl('https://developer.mozilla.org/')).not.toBe(
      canonicalizeUrl('https://mozilla.org/')
    )
  })

  it.each([
    ['chaîne vide', ''],
    ['espaces seuls', '   '],
    ['hôte sans point', 'https://localhost:3000/'],
    ['schéma non http', 'ftp://example.com/'],
    ['schéma javascript', 'javascript:alert(1)'],
    ['texte quelconque', 'pas une url du tout'],
  ])('refuse une entrée inexploitable : %s', (_label, input) => {
    expect(canonicalizeUrl(input)).toBeNull()
  })
})

describe('extractDomain', () => {
  it('retourne le domaine sans www', () => {
    expect(extractDomain('https://www.anthropic.com/news')).toBe('anthropic.com')
  })

  it('conserve le sous-domaine', () => {
    expect(extractDomain('https://developer.mozilla.org/docs')).toBe('developer.mozilla.org')
  })

  it('retourne null sur une URL invalide', () => {
    expect(extractDomain('pas-une-url')).toBeNull()
  })
})

describe('deriveNameFromDomain', () => {
  it.each([
    ['react.dev', 'React'],
    ['developer.mozilla.org', 'Mozilla'],
    ['tailwindcss.com', 'Tailwindcss'],
  ])('déduit un nom lisible de %s', (domain, expected) => {
    expect(deriveNameFromDomain(domain)).toBe(expected)
  })
})
