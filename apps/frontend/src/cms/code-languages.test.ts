import { describe, expect, it } from 'vitest'

import { CODE_LANGUAGES, FENCE_ALIASES, normalizeCodeLanguage } from './code-languages'

describe('normalizeCodeLanguage', () => {
  it('keeps a language the block already offers', () => {
    expect(normalizeCodeLanguage('typescript')).toBe('typescript')
    expect(normalizeCodeLanguage('json')).toBe('json')
  })

  /*
   * The case that used to take a whole save down: `ts` is the likeliest fence tag
   * here and is not a Monaco identifier, so the block's select rejected it and
   * the article could not be written at all.
   */
  it('maps the fence tags people actually type', () => {
    expect(normalizeCodeLanguage('ts')).toBe('typescript')
    expect(normalizeCodeLanguage('tsx')).toBe('typescript')
    expect(normalizeCodeLanguage('js')).toBe('javascript')
    expect(normalizeCodeLanguage('bash')).toBe('shell')
  })

  it('ignores case and surrounding space', () => {
    expect(normalizeCodeLanguage(' TS ')).toBe('typescript')
    expect(normalizeCodeLanguage('Bash')).toBe('shell')
  })

  it('falls back to plain text rather than failing', () => {
    for (const unknown of [undefined, null, '', '   ', 'brainfuck', 'typescriptt']) {
      expect(normalizeCodeLanguage(unknown)).toBe('plaintext')
    }
  })

  /*
   * An alias pointing at a language the block does not offer would validate just
   * as badly as the raw tag did.
   */
  it('only ever returns a language the block offers', () => {
    const offered = Object.keys(CODE_LANGUAGES)

    for (const target of Object.values(FENCE_ALIASES)) {
      expect(offered).toContain(target)
    }
    for (const alias of Object.keys(FENCE_ALIASES)) {
      expect(offered).toContain(normalizeCodeLanguage(alias))
    }
  })
})
