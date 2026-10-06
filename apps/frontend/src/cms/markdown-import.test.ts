import { beforeEach, describe, expect, it, vi } from 'vitest'

import { withMarkdownImport } from './markdown-import'

/**
 * The hook is mocked at the editor boundary on purpose: sanitizing a real editor
 * config means booting Payload, and what matters here is the decision — when the
 * body is replaced, when it is left alone, and that the paste field never
 * survives a conversion.
 */
vi.mock('@payloadcms/richtext-lexical', () => ({
  editorConfigFactory: { default: vi.fn(() => Promise.resolve({ sanitized: true })) },
  convertMarkdownToLexical: vi.fn(({ markdown }: { markdown: string }) => ({
    root: { converted: markdown },
  })),
}))

const { convertMarkdownToLexical } = await import('@payloadcms/richtext-lexical')

const hook = withMarkdownImport({ markdown: 'markdownImport', content: 'content' })

type HookArgs = Parameters<typeof hook>[0]

/** Calls the hook with the pieces of context it actually reads. */
const run = async (data: Record<string, unknown>): Promise<Record<string, unknown>> => {
  // The hook is typed as returning `any`, so the result is narrowed here rather
  // than letting an untyped value spread through the assertions.
  const result: unknown = await hook({
    collection: { slug: 'posts' },
    context: {},
    data,
    operation: 'update',
    req: { payload: { config: { collections: [] } } },
  } as unknown as HookArgs)

  return result as Record<string, unknown>
}

describe('withMarkdownImport', () => {
  beforeEach(() => {
    vi.mocked(convertMarkdownToLexical).mockClear()
  })

  it('converts the pasted Markdown into the body', async () => {
    const result = await run({ title: 'Server Components', markdownImport: '# Title\n\nBody.' })

    expect(result).toMatchObject({
      title: 'Server Components',
      content: { root: { converted: '# Title\n\nBody.' } },
    })
  })

  it('clears the paste field it consumed', async () => {
    const result = await run({ markdownImport: 'Some prose.' })

    expect(result.markdownImport).toBeNull()
  })

  /*
   * The case that would destroy an article: saving a document after editing its
   * title leaves the paste box empty, and an empty box must never be treated as
   * "replace the body with nothing".
   */
  it('leaves an existing body untouched when nothing was pasted', async () => {
    const stored = { root: { children: [] } }

    for (const empty of [undefined, '', '   ', null]) {
      const result = await run({ content: stored, markdownImport: empty })

      expect(result.content).toBe(stored)
      expect(convertMarkdownToLexical).not.toHaveBeenCalled()
    }
  })
})
