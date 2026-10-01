/**
 * The site's public origin, and absolute URLs built from it.
 *
 * Metadata, structured data, the feed and the sitemap all need absolute URLs,
 * and each of them was about to read the environment variable itself. One
 * definition keeps them from disagreeing, and keeps the trailing-slash handling
 * in a single place — `https://adem.dev/` plus `/blog` would otherwise produce a
 * double slash that search engines read as a different address.
 *
 * Unlike a secret, this one takes a fallback: a wrong base URL degrades
 * metadata, it opens nothing, and development has to work with no configuration
 * at all.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

/** Absolute URL for an app path, with or without its leading slash. */
const absoluteUrl = (path: string): string =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

export { SITE_URL, absoluteUrl }
