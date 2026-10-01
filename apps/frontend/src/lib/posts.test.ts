import { describe, expect, it, vi } from 'vitest'

/*
 * `posts.ts` imports the Payload config, which fails at load time when the
 * environment carries no secret — by design, see `lib/require-env.ts`. Both
 * boundaries are replaced by factories so the module under test loads without
 * booting Payload; what is exercised here is pure text handling.
 */
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))

const { DESCRIPTION_LIMIT, resolveDescription } = await import('./posts')

/** Editor state holding one paragraph of the given text. */
const bodyOf = (text: string) =>
  ({
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          children: [
            { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
          ],
        },
      ],
    },
  }) as unknown as Parameters<typeof resolveDescription>[1]

describe('resolveDescription', () => {
  it('prefers the excerpt the author wrote', () => {
    expect(resolveDescription('A written summary.', bodyOf('The body says something else.'))).toBe(
      'A written summary.'
    )
  })

  it('falls back to the opening of the body', () => {
    expect(resolveDescription(null, bodyOf('Server Components change where data is read.'))).toBe(
      'Server Components change where data is read.'
    )
  })

  it('returns null when there is neither', () => {
    expect(resolveDescription(null, null)).toBeNull()
    expect(resolveDescription(null, bodyOf('   '))).toBeNull()
  })

  it('collapses the whitespace the editor leaves behind', () => {
    expect(resolveDescription(null, bodyOf('Two  spaces\tand\na break.'))).toBe(
      'Two spaces and a break.'
    )
  })

  /*
   * A description cut mid-word reads as broken rather than as truncated, and it
   * is the text a search result shows.
   */
  it('cuts on a word boundary and marks the cut', () => {
    const long = `${'word '.repeat(60)}end`
    const result = resolveDescription(null, bodyOf(long))

    expect(result).not.toBeNull()
    expect(result!.length).toBeLessThanOrEqual(DESCRIPTION_LIMIT + 1)
    expect(result!.endsWith('…')).toBe(true)
    expect(result).not.toMatch(/wor…$/)
  })

  it('leaves a body shorter than the limit untouched', () => {
    const short = 'Exactly the kind of length a summary wants.'
    expect(resolveDescription(null, bodyOf(short))).toBe(short)
  })

  it('does not leave punctuation hanging before the ellipsis', () => {
    const text = `${'word '.repeat(31)}tail, and more words after the comma`
    const result = resolveDescription(null, bodyOf(text))

    expect(result).not.toMatch(/,…$/)
  })
})
