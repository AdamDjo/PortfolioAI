/**
 * The languages a code block may carry, and how a Markdown fence tag maps onto
 * them.
 *
 * Payload's premade block offers the whole Monaco list — eighty entries, most of
 * which will never appear here, and without `json`. The list is narrowed to what
 * actually gets written on this blog, which also keeps the admin dropdown usable.
 *
 * The identifiers are Monaco's, because the editor component expects them.
 */
const CODE_LANGUAGES = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sql: 'SQL',
  shell: 'Shell',
  yaml: 'YAML',
  markdown: 'Markdown',
  plaintext: 'Texte brut',
} as const

type CodeLanguage = keyof typeof CODE_LANGUAGES

/**
 * What people actually type after the three backticks.
 *
 * `ts` is the likeliest fence tag on a blog about TypeScript, and it is not a
 * Monaco identifier — left alone it fails the block's `select` validation and
 * takes the whole save down with it. JSX and TSX collapse onto their base
 * language: the highlighting difference is not worth a second entry in the
 * dropdown.
 */
const FENCE_ALIASES: Record<string, CodeLanguage> = {
  bash: 'shell',
  js: 'javascript',
  jsonc: 'json',
  jsx: 'javascript',
  md: 'markdown',
  mjs: 'javascript',
  postgres: 'sql',
  psql: 'sql',
  sh: 'shell',
  text: 'plaintext',
  ts: 'typescript',
  tsx: 'typescript',
  txt: 'plaintext',
  zsh: 'shell',
}

/**
 * Turns a fence tag into a language the block accepts.
 *
 * An unknown tag becomes plain text rather than an error: a fence written with
 * something exotic — or misspelled — must never be the reason an article refuses
 * to save. The code is still shown, only without its syntax colours.
 */
const normalizeCodeLanguage = (fence: string | null | undefined): CodeLanguage => {
  const tag = typeof fence === 'string' ? fence.trim().toLowerCase() : ''
  if (tag === '') return 'plaintext'
  if (tag in CODE_LANGUAGES) return tag as CodeLanguage
  return FENCE_ALIASES[tag] ?? 'plaintext'
}

export { CODE_LANGUAGES, FENCE_ALIASES, normalizeCodeLanguage, type CodeLanguage }
