import { canonicalizeUrl, deriveNameFromDomain } from './canonical-url'
import { fetchOpenGraphMetadata } from './open-graph'

import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Hook `beforeChange` partagé : renseigne un aperçu depuis les balises Open Graph
 * de l'URL saisie.
 *
 * Deux collections en dépendent (`projects` et `bookmarks`) et le comportement
 * attendu est identique : normaliser l'URL, aller chercher titre/description/image
 * une seule fois, et ne jamais écraser ce qui a été saisi à la main. Le hook est
 * donc paramétré par les noms de champs plutôt que dupliqué.
 */

/** Noms des champs alimentés par le hook dans la collection appelante. */
interface OpenGraphPreviewFields {
  /** Champ portant l'URL saisie. Il est réécrit sous sa forme canonique. */
  url: string
  /** Champ titre, complété si laissé vide. */
  title: string
  /** Champ description, complété si laissé vide. */
  description?: string
  /** Champ recevant l'URL de l'image d'aperçu. */
  imageUrl: string
  /** Champ recevant le domaine, utile pour l'affichage et le favicon. */
  domain?: string
}

/**
 * Lit une valeur de formulaire comme texte utile.
 *
 * Un champ vidé depuis l'administration arrive comme chaîne vide, pas comme
 * `null` : on le traite donc comme absent afin que la valeur automatique
 * reprenne la main.
 */
const readTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

/**
 * Construit le hook `beforeChange` pour une collection décrite par ses champs.
 *
 * L'appel réseau n'a lieu que si l'URL est nouvelle ou a changé : une simple
 * modification de tag ou de titre ne redéclenche pas de requête sortante.
 */
const withOpenGraphPreview = (fields: OpenGraphPreviewFields): CollectionBeforeChangeHook => {
  return async ({ data, originalDoc, operation }) => {
    const record = data as Record<string, unknown>
    const raw = readTrimmedString(record[fields.url])
    if (!raw) return data

    const url = canonicalizeUrl(raw)
    // URL inexploitable : on laisse la validation du champ produire l'erreur
    // plutôt que d'écrire une valeur à moitié normalisée.
    if (!url) return data

    const domain = new URL(url).hostname
    const previous = originalDoc as Record<string, unknown> | undefined
    const previousUrl = readTrimmedString(previous?.[fields.url])

    // Rien de nouveau côté URL : on garde l'aperçu déjà en base.
    if (operation !== 'create' && url === previousUrl) {
      return { ...data, [fields.url]: url }
    }

    const metadata = await fetchOpenGraphMetadata(url)

    const next: Record<string, unknown> = {
      ...record,
      [fields.url]: url,
      [fields.imageUrl]: metadata.imageUrl,
      // Les valeurs saisies à la main ne sont jamais écrasées. En dernier
      // recours, le nom déduit du domaine reste plus lisible que l'URL brute.
      [fields.title]:
        readTrimmedString(record[fields.title]) ?? metadata.title ?? deriveNameFromDomain(domain),
    }

    if (fields.description) {
      next[fields.description] =
        readTrimmedString(record[fields.description]) ?? metadata.description ?? undefined
    }

    if (fields.domain) {
      next[fields.domain] = domain
    }

    return next
  }
}

export { readTrimmedString, withOpenGraphPreview }
