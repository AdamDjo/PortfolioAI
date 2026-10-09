import { describe, expect, it, vi } from 'vitest'

// `preview.ts` reaches Payload for the session check; only the parser is under
// test here, so the boundaries are stubbed and Payload never boots.
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))

const { parsePreviewTarget } = await import('./preview')

const parse = (query: string) => parsePreviewTarget(new URLSearchParams(query))

describe('parsePreviewTarget', () => {
  it('accepts a known locale and a slug', () => {
    expect(parse('locale=fr&slug=server-components-101')).toEqual({
      locale: 'fr',
      slug: 'server-components-101',
    })
  })

  it.each([
    ['a missing slug', 'locale=fr'],
    ['an unknown locale', 'locale=de&slug=article'],
    ['a path in the slug', 'locale=fr&slug=../admin'],
    ['an absolute URL in the slug', 'locale=fr&slug=https://evil.example'],
    ['a protocol-relative slug', 'locale=fr&slug=//evil.example'],
    ['uppercase letters', 'locale=fr&slug=Article'],
    ['a trailing hyphen', 'locale=fr&slug=article-'],
  ])('rejects %s', (_, query) => {
    expect(parse(query)).toBeNull()
  })
})
