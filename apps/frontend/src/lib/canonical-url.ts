/**
 * Normalisation des URL avant stockage.
 *
 * Un même lien copié depuis une newsletter, un tweet ou la barre d'adresse arrive
 * sous trois formes différentes. On les ramène à une écriture unique afin que la
 * contrainte d'unicité en base détecte réellement les doublons — sans pour autant
 * confondre deux pages distinctes du même site.
 */

/**
 * Paramètres de suivi retirés systématiquement : ils identifient la campagne qui
 * a amené le lien, jamais la ressource elle-même.
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

/** Préfixes de paramètres de suivi : `utm_source`, `utm_campaign`, etc. */
const TRACKING_PREFIXES: readonly string[] = ['utm_', 'pk_', 'mtm_', 'hsa_', 'oly_', 'wt_']

const isTrackingParam = (key: string): boolean => {
  const lower = key.toLowerCase()
  if (TRACKING_PARAMS.includes(lower)) return true
  return TRACKING_PREFIXES.some((prefix) => lower.startsWith(prefix))
}

/**
 * Réécrit une URL sous sa forme canonique.
 *
 * - complète le schéma manquant (`react.dev` → `https://react.dev`)
 * - met l'hôte en minuscules et retire le `www.` de tête
 * - supprime les paramètres de suivi, puis trie ceux qui restent
 * - retire le fragment, qui ne désigne pas une autre ressource
 * - retire la barre oblique finale, sauf à la racine
 *
 * Retourne `null` si la chaîne n'est pas une URL http(s) exploitable. Ne fait
 * aucune requête réseau : la validation de la cible relève de `open-graph.ts`.
 */
const canonicalizeUrl = (raw: string): string | null => {
  const candidate = raw.trim()
  if (!candidate) return null

  let url: URL
  try {
    // Une saisie sans schéma est traitée comme https, cas courant d'un copier-coller.
    url = new URL(candidate.includes('://') ? candidate : `https://${candidate}`)
  } catch {
    return null
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  // Un hôte sans point n'est pas un domaine public (`localhost`, intranet…).
  if (!url.hostname.includes('.')) return null

  // Les identifiants n'ont rien à faire dans un lien stocké.
  url.username = ''
  url.password = ''

  url.hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  url.hash = ''

  const kept = [...url.searchParams.entries()].filter(([key]) => !isTrackingParam(key))
  // Le tri rend l'ordre des paramètres non significatif : `?a=1&b=2` et
  // `?b=2&a=1` désignent la même page et doivent produire la même clé.
  kept.sort(([a], [b]) => a.localeCompare(b))
  url.search = ''
  for (const [key, value] of kept) url.searchParams.append(key, value)

  // `/docs/` et `/docs` sont la même page ; `/` reste `/`.
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1)
  }

  return url.href
}

/** Domaine affichable, sans `www.`. `null` si l'URL est inexploitable. */
const extractDomain = (raw: string): string | null => {
  const canonical = canonicalizeUrl(raw)
  if (!canonical) return null
  return new URL(canonical).hostname
}

/**
 * Nom lisible déduit du domaine, utilisé quand la page distante n'expose pas de
 * titre : `developer.mozilla.org` → `Mozilla`.
 */
const deriveNameFromDomain = (domain: string): string => {
  const parts = domain.split('.')
  const label = parts.length > 2 ? parts[parts.length - 2] : parts[0]
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export { canonicalizeUrl, deriveNameFromDomain, extractDomain }
