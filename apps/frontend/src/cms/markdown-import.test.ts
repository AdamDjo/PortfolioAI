import { beforeEach, describe, expect, it, vi } from 'vitest'

import { normalizeCodeBlocks, withMarkdownImport } from './markdown-import'

/**
 * The hook is mocked at the editor boundary on purpose: sanitizing a real editor
 * config means booting Payload, and what matters here is the decision — when the
 * body is replaced, when it is left alone, and that the paste field never
 * survives a conversion.
 */
vi.mock('@payloadcms/richtext-lexical', () => ({
  editorConfigFactory: { fromFeatures: vi.fn(() => Promise.resolve({ sanitized: true })) },
  convertMarkdownToLexical: vi.fn(({ markdown }: { markdown: string }) => ({
    root: { converted: markdown },
  })),
  // `editor.ts` builds the shared editor at module load, so these have to exist
  // even though the test never looks at what they return.
  lexicalEditor: vi.fn(() => ({})),
  BlocksFeature: vi.fn(() => ({})),
  CodeBlock: vi.fn(() => ({})),
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

describe('normalizeCodeBlocks', () => {
  /** A converted tree holding one code block with the given fence tag. */
  const treeWith = (language: unknown) => ({
    type: 'root',
    children: [
      { type: 'heading', children: [{ type: 'text', text: 'Titre' }] },
      { type: 'block', fields: { blockType: 'Code', code: 'const a = 1', language } },
    ],
  })

  it('rewrites a fence tag the field would reject', () => {
    const tree = treeWith('ts')
    normalizeCodeBlocks(tree)

    expect(tree.children[1].fields?.language).toBe('typescript')
  })

  it('leaves an accepted language alone', () => {
    const tree = treeWith('json')
    normalizeCodeBlocks(tree)

    expect(tree.children[1].fields?.language).toBe('json')
  })

  it('reaches a block nested inside another node', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'list',
          children: [
            { type: 'block', fields: { blockType: 'Code', code: 'ls', language: 'bash' } },
          ],
        },
      ],
    }
    normalizeCodeBlocks(tree)

    expect(tree.children[0].children[0].fields?.language).toBe('shell')
  })

  it('does not touch a block of another kind', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'block', fields: { blockType: 'Quote', language: 'ts' } }],
    }
    normalizeCodeBlocks(tree)

    expect(tree.children[0].fields?.language).toBe('ts')
  })

  it('walks a tree with no block at all', () => {
    const tree = { type: 'root', children: [{ type: 'paragraph' }] }

    expect(() => normalizeCodeBlocks(tree)).not.toThrow()
  })
})
