import { describe, expect, it } from 'vitest'

import { toSlug } from './slug'

describe('toSlug', () => {
  it('lowercases and joins words with a single dash', () => {
    expect(toSlug('Server Components in practice')).toBe('server-components-in-practice')
  })

  it('strips diacritics instead of escaping them', () => {
    expect(toSlug('Accessibilité réelle')).toBe('accessibilite-reelle')
  })

  it('collapses punctuation and runs of separators', () => {
    expect(toSlug('Next.js 16 — what changed?')).toBe('next-js-16-what-changed')
  })

  it('never leaves a leading or trailing dash', () => {
    expect(toSlug('  :: hello ::  ')).toBe('hello')
  })

  it('returns an empty string when nothing survives', () => {
    expect(toSlug('——')).toBe('')
  })

  /*
   * The guarantee the veille relies on: two names that differ only by case,
   * accent or punctuation must collapse to the same slug, so the unique index
   * catches the near-duplicate instead of letting a second tag through.
   */
  it('collapses near-duplicates onto one slug', () => {
    expect(toSlug('React')).toBe(toSlug('react'))
    expect(toSlug('React JS')).toBe(toSlug('react-js'))
  })
})
