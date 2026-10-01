import { BlocksFeature, CodeBlock, lexicalEditor } from '@payloadcms/richtext-lexical'

import { CODE_LANGUAGES } from './code-languages'

import type { LexicalEditorProps } from '@payloadcms/richtext-lexical'

/**
 * The rich text editor, defined once and shared.
 *
 * It lives in its own module rather than inline in `payload.config.ts` because
 * the Markdown import needs the very same feature set to convert against. A
 * second definition would silently diverge: the import would then drop any node
 * the editor had gained, which is exactly how code fences used to end up as
 * paragraphs.
 *
 * `defaultFeatures` is kept and extended, never replaced — dropping it would take
 * headings, lists and links with it.
 */
/* Derived from the editor's own props: the package does not export the type. */
type EditorFeatures = NonNullable<LexicalEditorProps['features']>

const editorFeatures: EditorFeatures = ({ defaultFeatures }) => [
  ...defaultFeatures,
  /*
   * Lexical has no code block of its own; Payload ships one as a block, with the
   * Markdown converter that recognises a ``` fence and reads its language. It is
   * marked experimental upstream, which is the trade accepted here: the
   * alternative was writing the block, its transformer and its converter by hand.
   */
  BlocksFeature({ blocks: [CodeBlock({ languages: CODE_LANGUAGES })] }),
]

const editor = lexicalEditor({ features: editorFeatures })

export { editor, editorFeatures }
