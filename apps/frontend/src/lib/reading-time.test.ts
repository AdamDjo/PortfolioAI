import { describe, expect, it } from 'vitest'

import { WORDS_PER_MINUTE, computeReadingTime, type RichTextValue } from './reading-time'

/** Minimal editor state holding one paragraph per argument. */
const stateOf = (...paragraphs: string[]): RichTextValue => ({
  root: {
    type: 'root',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: [
        { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
      ],
    })),
  },
})

const wordsOf = (count: number) =>
  Array.from({ length: count }, (_, index) => `w${index}`).join(' ')

describe('computeReadingTime', () => {
  it('returns 0 for an absent body, so nothing is displayed', () => {
    expect(computeReadingTime(null)).toBe(0)
    expect(computeReadingTime(undefined)).toBe(0)
  })

  it('returns 0 for an empty body', () => {
    expect(computeReadingTime(stateOf(''))).toBe(0)
  })

  it('announces a minute for anything shorter than a minute', () => {
    expect(computeReadingTime(stateOf('three short words'))).toBe(1)
  })

  it('rounds up rather than down', () => {
    expect(computeReadingTime(stateOf(wordsOf(WORDS_PER_MINUTE + 1)))).toBe(2)
  })

  it('counts across paragraphs', () => {
    const half = wordsOf(WORDS_PER_MINUTE / 2)
    expect(computeReadingTime(stateOf(half, half))).toBe(1)
    expect(computeReadingTime(stateOf(half, half, half))).toBe(2)
  })

  /*
   * The reason the count runs on extracted text rather than on the stored value:
   * every node carries a type, formatting flags and a version, so a handful of
   * words spread over many paragraphs serializes into something far larger than
   * the prose it holds.
   */
  it('ignores the structure around the words', () => {
    const state = stateOf(...Array.from({ length: 20 }, (_, index) => `word${index}`))

    expect(JSON.stringify(state).length).toBeGreaterThan(2000)
    expect(computeReadingTime(state)).toBe(1)
  })
})
