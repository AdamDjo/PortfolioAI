import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

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
 * Markdown constructs have a node to land in. `editorConfigFactory.default`
 * is the right source because `payload.config.ts` mounts `lexicalEditor()` with
 * no feature override — the day it takes one, this call has to switch to
 * `fromField` or the import would quietly drop the added nodes.
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

    const editorConfig = await editorConfigFactory.default({ config: req.payload.config })

    return {
      ...record,
      [fields.content]: convertMarkdownToLexical({ editorConfig, markdown }),
      [fields.markdown]: null,
    }
  }
}

export { withMarkdownImport }
