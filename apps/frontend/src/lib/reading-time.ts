import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

/**
 * The shape a Lexical field holds, derived from the converter rather than
 * imported from `lexical`.
 *
 * `lexical` is a transitive dependency of the Payload editor, not one this app
 * declares, so importing its types directly would tie our code to a package
 * pnpm is free to stop exposing. Deriving the type from the function we already
 * call keeps the dependency honest and the two in sync by construction.
 */
type RichTextValue = Parameters<typeof convertLexicalToPlaintext>[0]['data']

/**
 * Words a reader covers in a minute.
 *
 * 200 is the usual figure for technical prose in a Latin script — deliberately
 * lower than the 250 quoted for casual reading, because an article here carries
 * code blocks a reader stops on.
 */
const WORDS_PER_MINUTE = 200

/**
 * Minutes an article takes to read, rounded up and never zero.
 *
 * The count runs on the plain text extracted from the editor state, not on the
 * serialized JSON: node types, formatting flags and upload identifiers would
 * otherwise inflate it several times over.
 *
 * A one-sentence post still announces "1 min", because "0 min" reads like a
 * bug rather than like a short article.
 */
const computeReadingTime = (content: RichTextValue | null | undefined): number => {
  if (!content) return 0

  const words = convertLexicalToPlaintext({ data: content })
    .split(/\s+/)
    .filter((word) => word !== '')

  if (words.length === 0) return 0
  return Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE))
}

export { WORDS_PER_MINUTE, computeReadingTime, type RichTextValue }
