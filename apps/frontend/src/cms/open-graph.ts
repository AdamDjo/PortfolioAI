import { lookup } from 'dns/promises'

/**
 * Extraction of a remote page's Open Graph metadata.
 *
 * This function fetches a URL supplied from the admin, which makes it a potential
 * SSRF vector. The guards below are deliberately restrictive — better to refuse
 * an exotic URL than to let the server reach an internal resource.
 */

/** Usable metadata extracted from a remote page. */
interface OpenGraphMetadata {
  title: string | null
  description: string | null
  imageUrl: string | null
}

const FETCH_TIMEOUT_MS = 8_000

/** Reading stops past this point: the `<head>` tags arrive well before it. */
const MAX_BYTES = 512 * 1_024

/**
 * Reserved or private ranges (RFC 1918, loopback, link-local, CGNAT…).
 * A URL resolving to one of them is refused.
 */
const BLOCKED_IPV4_RANGES: readonly (readonly [string, number])[] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]

const ipv4ToInteger = (address: string): number | null => {
  const parts = address.split('.')
  if (parts.length !== 4) return null

  let result = 0
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null
    const octet = Number(part)
    if (octet > 255) return null
    result = result * 256 + octet
  }
  return result
}

const isBlockedIpv4 = (address: string): boolean => {
  const value = ipv4ToInteger(address)
  if (value === null) return true

  return BLOCKED_IPV4_RANGES.some(([range, bits]) => {
    const base = ipv4ToInteger(range)
    if (base === null) return false
    const mask = bits === 0 ? 0 : (-1 << (32 - bits)) >>> 0
    return (value & mask) === (base & mask)
  })
}

const isBlockedIpv6 = (address: string): boolean => {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, '')

  // Loopback, unspecified, link-local (fe80::/10) and unique-local (fc00::/7).
  if (normalized === '::1' || normalized === '::') return true
  if (/^fe[89ab]/.test(normalized)) return true
  if (/^f[cd]/.test(normalized)) return true

  // IPv4-mapped address, decimal notation (`::ffff:127.0.0.1`).
  const mappedDecimal = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(normalized)
  if (mappedDecimal) return isBlockedIpv4(mappedDecimal[1])

  // Same address after normalisation by `new URL()`, which rewrites it in
  // hexadecimal (`::ffff:7f00:1`). Without this case, a disguised loopback got
  // through.
  const mappedHex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(normalized)
  if (mappedHex) {
    const high = Number.parseInt(mappedHex[1], 16)
    const low = Number.parseInt(mappedHex[2], 16)
    const ipv4 = [high >> 8, high & 0xff, low >> 8, low & 0xff].join('.')
    return isBlockedIpv4(ipv4)
  }

  // Any other IPv4-mapped form is refused out of caution.
  if (normalized.startsWith('::ffff:')) return true

  return false
}

/**
 * Validates the URL, then checks that its host does not resolve to an internal
 * address. Returns the parsed URL, or `null` when it must be refused.
 */
const resolveSafeUrl = async (rawUrl: string): Promise<URL | null> => {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }

  // HTTP(S) only: rules out file:, ftp:, gopher:, data:…
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  // Credentials in the URL have no reason to be here.
  if (url.username || url.password) return null

  const hostname = url.hostname.replace(/^\[|\]$/g, '')

  // Host already a literal: decided without DNS resolution.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return isBlockedIpv4(hostname) ? null : url
  }
  if (hostname.includes(':')) {
    return isBlockedIpv6(hostname) ? null : url
  }
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return null

  // Domain name: every resolved address must be public.
  try {
    const records = await lookup(hostname, { all: true, verbatim: true })
    if (records.length === 0) return null

    const hasBlocked = records.some((record) =>
      record.family === 4 ? isBlockedIpv4(record.address) : isBlockedIpv6(record.address)
    )
    return hasBlocked ? null : url
  } catch {
    return null
  }
}

/** Reads the response, stopping at `MAX_BYTES`, without loading the whole body. */
const readCappedText = async (response: Response): Promise<string> => {
  const body = response.body
  if (!body) return ''

  const reader = body.getReader()
  const decoder = new TextDecoder()
  const chunks: string[] = []
  let total = 0

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue

      total += value.byteLength
      chunks.push(decoder.decode(value, { stream: true }))
      if (total >= MAX_BYTES) break
    }
  } finally {
    await reader.cancel().catch(() => undefined)
  }

  return chunks.join('')
}

/**
 * Looks for a meta tag's content, whether `property`/`name` comes before or
 * after the `content` attribute.
 */
const findMetaContent = (html: string, names: readonly string[]): string | null => {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']+)["']`,
        'i'
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${escaped}["']`,
        'i'
      ),
    ]

    for (const pattern of patterns) {
      const match = pattern.exec(html)
      if (match?.[1]) return decodeHtmlEntities(match[1].trim())
    }
  }
  return null
}

/** Extracts the `<title>` tag content, used as a last resort. */
const findTitleTag = (html: string): string | null => {
  const match = /<title[^>]*>([^<]+)</i.exec(html)
  const value = match?.[1]?.trim()
  return value ? decodeHtmlEntities(value) : null
}

/** Resolves a possibly relative URL against the page URL. */
const toAbsoluteUrl = (value: string, base: string): string | null => {
  try {
    return new URL(value, base).href
  } catch {
    return null
  }
}

/** Decodes the few entities encountered in meta tags. */
const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')

/**
 * Fetches the Open Graph metadata of a public URL.
 *
 * Never throws: any error (refused URL, unreachable host, page without tags)
 * turns into `null` fields, leaving the admin free to supply a visual by hand.
 */
const fetchOpenGraphMetadata = async (rawUrl: string): Promise<OpenGraphMetadata> => {
  const empty: OpenGraphMetadata = { title: null, description: null, imageUrl: null }

  const url = await resolveSafeUrl(rawUrl)
  if (!url) return empty

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        // Some sites only serve Open Graph tags to known agents.
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioPreviewBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    })

    if (!response.ok) return empty

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('html')) return empty

    const html = await readCappedText(response)

    const imageUrl = findMetaContent(html, ['og:image', 'og:image:url', 'twitter:image'])

    return {
      title: findMetaContent(html, ['og:title', 'twitter:title']) ?? findTitleTag(html),
      description: findMetaContent(html, ['og:description', 'twitter:description', 'description']),
      // A relative image is resolved against the page URL.
      imageUrl: imageUrl ? toAbsoluteUrl(imageUrl, url.href) : null,
    }
  } catch {
    return empty
  } finally {
    clearTimeout(timeout)
  }
}

// `resolveSafeUrl` carries the security decision: it is exported to be tested
// directly, not to be called elsewhere in the application.
export { fetchOpenGraphMetadata, resolveSafeUrl }
