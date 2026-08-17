import { lookup } from 'dns/promises'

/**
 * Extraction des métadonnées Open Graph d'une page distante.
 *
 * Cette fonction récupère une URL fournie depuis l'administration : elle est donc
 * un vecteur SSRF potentiel. Les garde-fous ci-dessous sont volontairement
 * restrictifs — mieux vaut refuser une URL exotique que laisser le serveur
 * atteindre une ressource interne.
 */

/** Métadonnées exploitables extraites d'une page distante. */
interface OpenGraphMetadata {
  title: string | null
  description: string | null
  imageUrl: string | null
}

const FETCH_TIMEOUT_MS = 8_000

/** Au-delà, on arrête la lecture : les balises `<head>` arrivent bien avant. */
const MAX_BYTES = 512 * 1_024

/**
 * Plages réservées ou privées (RFC 1918, loopback, link-local, CGNAT…).
 * Une URL qui résout vers l'une d'elles est refusée.
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

  // Loopback, non spécifiée, link-local (fe80::/10) et unique-local (fc00::/7).
  if (normalized === '::1' || normalized === '::') return true
  if (/^fe[89ab]/.test(normalized)) return true
  if (/^f[cd]/.test(normalized)) return true

  // Adresse IPv4 encapsulée, notation décimale (`::ffff:127.0.0.1`).
  const mappedDecimal = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(normalized)
  if (mappedDecimal) return isBlockedIpv4(mappedDecimal[1])

  // Même adresse après normalisation par `new URL()`, qui la réécrit en
  // hexadécimal (`::ffff:7f00:1`). Sans ce cas, un loopback déguisé passait.
  const mappedHex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(normalized)
  if (mappedHex) {
    const high = Number.parseInt(mappedHex[1], 16)
    const low = Number.parseInt(mappedHex[2], 16)
    const ipv4 = [high >> 8, high & 0xff, low >> 8, low & 0xff].join('.')
    return isBlockedIpv4(ipv4)
  }

  // Toute autre forme encapsulant de l'IPv4 est refusée par prudence.
  if (normalized.startsWith('::ffff:')) return true

  return false
}

/**
 * Valide l'URL puis vérifie que son hôte ne résout pas vers une adresse interne.
 * Retourne l'URL analysée, ou `null` si elle doit être refusée.
 */
const resolveSafeUrl = async (rawUrl: string): Promise<URL | null> => {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }

  // Seul HTTP(S) est autorisé : écarte file:, ftp:, gopher:, data:…
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  // Les identifiants dans l'URL n'ont aucune raison d'être ici.
  if (url.username || url.password) return null

  const hostname = url.hostname.replace(/^\[|\]$/g, '')

  // Hôte déjà littéral : on tranche sans résolution DNS.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return isBlockedIpv4(hostname) ? null : url
  }
  if (hostname.includes(':')) {
    return isBlockedIpv6(hostname) ? null : url
  }
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return null

  // Nom de domaine : toutes les adresses résolues doivent être publiques.
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

/** Lit la réponse en s'arrêtant à `MAX_BYTES`, sans charger tout le corps. */
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
 * Cherche le contenu d'une balise meta, que `property`/`name` précède ou suive
 * l'attribut `content`.
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

/** Extrait le contenu de la balise `<title>`, utilisé en dernier recours. */
const findTitleTag = (html: string): string | null => {
  const match = /<title[^>]*>([^<]+)</i.exec(html)
  const value = match?.[1]?.trim()
  return value ? decodeHtmlEntities(value) : null
}

/** Résout une URL éventuellement relative contre l'URL de la page. */
const toAbsoluteUrl = (value: string, base: string): string | null => {
  try {
    return new URL(value, base).href
  } catch {
    return null
  }
}

/** Décode les quelques entités que l'on rencontre dans les balises meta. */
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
 * Récupère les métadonnées Open Graph d'une URL publique.
 *
 * Ne lève jamais : toute erreur (URL refusée, hôte injoignable, page sans balises)
 * se traduit par des champs `null`, laissant l'administrateur renseigner un visuel
 * manuellement.
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
        // Certains sites ne servent les balises Open Graph qu'aux agents connus.
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
      // Une image relative est résolue contre l'URL de la page.
      imageUrl: imageUrl ? toAbsoluteUrl(imageUrl, url.href) : null,
    }
  } catch {
    return empty
  } finally {
    clearTimeout(timeout)
  }
}

// `resolveSafeUrl` porte la décision de sécurité : il est exporté pour être
// testé directement, et non pour être appelé ailleurs dans l'application.
export { fetchOpenGraphMetadata, resolveSafeUrl }
