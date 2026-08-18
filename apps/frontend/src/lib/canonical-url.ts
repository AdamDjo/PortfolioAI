/**
 * URL normalisation before storage.
 *
 * The same link copied from a newsletter, a tweet or the address bar arrives in
 * three different forms. They are reduced to a single spelling so the database
 * uniqueness constraint actually catches duplicates — without conflating two
 * distinct pages of the same site.
 */

/**
 * Tracking parameters always stripped: they identify the campaign that brought
 * the link, never the resource itself.
 */
const TRACKING_PARAMS: readonly string[] = [
  'fbclid',
  'gclid',
  'igshid',
  'mc_cid',
  'mc_eid',
  'msclkid',
  'ref_src',
  'ref_url',
  's_cid',
  'twclid',
  'vero_conv',
  'vero_id',
  'yclid',
]

/** Tracking parameter prefixes: `utm_source`, `utm_campaign`, and so on. */
const TRACKING_PREFIXES: readonly string[] = ['utm_', 'pk_', 'mtm_', 'hsa_', 'oly_', 'wt_']

const isTrackingParam = (key: string): boolean => {
  const lower = key.toLowerCase()
  if (TRACKING_PARAMS.includes(lower)) return true
  return TRACKING_PREFIXES.some((prefix) => lower.startsWith(prefix))
}

/**
 * Rewrites a URL into its canonical form.
 *
 * - fills in the missing scheme (`react.dev` → `https://react.dev`)
 * - lowercases the host and drops a leading `www.`
 * - removes tracking parameters, then sorts the remaining ones
 * - removes the fragment, which does not designate another resource
 * - removes the trailing slash, except at the root
 *
 * Returns `null` when the string is not a usable http(s) URL. Makes no network
 * request: validating the target is `open-graph.ts`'s job.
 */
const canonicalizeUrl = (raw: string): string | null => {
  const candidate = raw.trim()
  if (!candidate) return null

  let url: URL
  try {
    // Input without a scheme is treated as https, the common copy-paste case.
    url = new URL(candidate.includes('://') ? candidate : `https://${candidate}`)
  } catch {
    return null
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  // A host without a dot is not a public domain (`localhost`, intranet…).
  if (!url.hostname.includes('.')) return null

  // Credentials have no place in a stored link.
  url.username = ''
  url.password = ''

  url.hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  url.hash = ''

  const kept = [...url.searchParams.entries()].filter(([key]) => !isTrackingParam(key))
  // Sorting makes parameter order insignificant: `?a=1&b=2` and `?b=2&a=1`
  // designate the same page and must produce the same key.
  kept.sort(([a], [b]) => a.localeCompare(b))
  url.search = ''
  for (const [key, value] of kept) url.searchParams.append(key, value)

  // `/docs/` and `/docs` are the same page; `/` stays `/`.
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1)
  }

  return url.href
}

/** Displayable domain, without `www.`. `null` when the URL is unusable. */
const extractDomain = (raw: string): string | null => {
  const canonical = canonicalizeUrl(raw)
  if (!canonical) return null
  return new URL(canonical).hostname
}

/**
 * Readable name derived from the domain, used when the remote page exposes no
 * title: `developer.mozilla.org` → `Mozilla`.
 */
const deriveNameFromDomain = (domain: string): string => {
  const parts = domain.split('.')
  const label = parts.length > 2 ? parts[parts.length - 2] : parts[0]
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export { canonicalizeUrl, deriveNameFromDomain, extractDomain }
