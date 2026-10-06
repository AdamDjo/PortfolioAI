import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

import { normalizeCodeLanguage } from './code-languages'
import { editorFeatures } from './editor'

import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Shared `beforeChange` hook: turns pasted Markdown into the rich text body.
 *
 * Articles are not written in the admin. They are drafted as Markdown in a real
 * editor — where the keyboard shortcuts, the spell checker and the version
 * history already live — then pasted into the document. Lexical is then only
 * used for retouching and for dropping images into the prose.
 *
 * Markdown deliberately stops at the prose: an image written as
 * `![alt](./shot.png)` points at a path that resolves to nothing once imported,
 * so media are attached in the editor afterwards, where the upload lands in the
 * `media` collection.
 */

/** The shape of the converted tree this hook walks; everything else is ignored. */
interface LexicalNodeLike {
  type?: string
  fields?: Record<string, unknown>
  children?: LexicalNodeLike[]
}

/**
 * Rewrites the language of every code block to one the field accepts.
 *
 * The converter copies the fence tag through verbatim, and the block stores its
 * language in a `select`. A tag outside that list — `ts`, which is the likeliest
 * one here — fails validation and takes the *whole article* down with it, not
 * just the snippet. Normalising here is what keeps a save from depending on how
 * someone spelled a fence.
 *
 * The tree is mutated rather than rebuilt: it was created a line earlier by the
 * converter and nothing else holds a reference to it.
 */
const normalizeCodeBlocks = (node: LexicalNodeLike): void => {
  if (node.type === 'block' && node.fields?.blockType === 'Code') {
    node.fields.language = normalizeCodeLanguage(node.fields.language as string | null | undefined)
  }

  for (const child of node.children ?? []) normalizeCodeBlocks(child)
}

/** Names of the two fields the hook bridges in the calling collection. */
interface MarkdownImportFields {
  /** Paste field. Cleared once its content has been converted. */
  markdown: string
  /** Rich text field receiving the converted body. */
  content: string
}

/**
 * Reads a form value as usable text.
 *
 * A field cleared from the admin arrives as an empty string rather than `null`,
 * and an empty paste box must not wipe the body that is already stored.
 */
const readTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

/**
 * Builds the hook for a collection described by its field names.
 *
 * The conversion is driven by the *editor's* config, not by a Markdown library
 * of our own: the same features that are enabled in the field decide which
 * Markdown constructs have a node to land in. It is built from the shared
 * feature list rather than from the defaults, which is what lets a ``` fence
 * reach the code block — with the defaults it had no node to land in and
 * degraded into a paragraph, delimiters and all.
 *
 * The paste field is emptied in the same write. It is an input, not a record:
 * leaving the Markdown behind would show two bodies in the admin and invite
 * editing the stale one.
 */
const withMarkdownImport = (fields: MarkdownImportFields): CollectionBeforeChangeHook => {
  return async ({ data, req }) => {
    const record = data as Record<string, unknown>
    const markdown = readTrimmedString(record[fields.markdown])
    if (!markdown) return data

    const editorConfig = await editorConfigFactory.fromFeatures({
      config: req.payload.config,
      features: editorFeatures,
    })

    const content = convertMarkdownToLexical({ editorConfig, markdown })
    normalizeCodeBlocks(content.root)

    return {
      ...record,
      [fields.content]: content,
      [fields.markdown]: null,
    }
  }
}

export { normalizeCodeBlocks, withMarkdownImport }
