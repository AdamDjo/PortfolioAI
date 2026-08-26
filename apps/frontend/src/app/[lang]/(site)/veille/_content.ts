import type { Locale } from '@/lib/i18n/config'

/**
 * Static editorial copy and metadata for the reading-list page, one per locale.
 *
 * The bookmarks themselves come from Payload instead — this file only holds
 * strings tied to the page's structure.
 */
const en = {
  metadata: {
    title: 'Reading list',
    description: 'My library of technical links, sorted by tag.',
  },
  heading: {
    eyebrow: 'Always reading',
    title: 'My link library, sorted by tag.',
    lead: 'The references I keep close at hand, with their previews. Filter by tag to find a resource in seconds.',
  },
  filter: {
    allTag: 'All',
    ariaLabel: 'Filter by tag',
  },
  composer: {
    inputLabel: 'Add a link',
    placeholder: 'Paste your link here…',
    submitIdle: 'Add',
    submitSaving: 'Adding…',
    invalidUrl: 'That does not look like a valid URL.',
    sessionExpired: 'Session expired. Sign in again from /admin.',
    saveFailed: 'This link already exists or could not be saved.',
    networkError: 'Could not save. Check your connection.',
  },
  tagPicker: {
    composerLabel: 'Tags for this link',
    cardLabel: 'Edit this link’s tags',
    noTags: 'No tags yet. Create some in /admin.',
    openLabel: 'Edit tags',
    saveFailed: 'The tags could not be saved.',
  },
  grid: {
    emptyState: 'No links published yet.',
    emptyFilteredState: 'No links with this tag yet.',
  },
}

type VeilleContent = typeof en

const fr: VeilleContent = {
  metadata: {
    title: 'Veille',
    description: 'Ma bibliothèque de liens techniques, triée par tags.',
  },
  heading: {
    eyebrow: 'Veille active',
    title: 'Ma bibliothèque de liens, triée par tags.',
    lead: 'Les références que je garde sous la main, avec leur aperçu. Filtre par tag pour retrouver une ressource en quelques secondes.',
  },
  filter: {
    allTag: 'Tous',
    ariaLabel: 'Filtrer par tag',
  },
  composer: {
    inputLabel: 'Ajouter un lien',
    placeholder: 'Collez votre lien ici…',
    submitIdle: 'Ajouter',
    submitSaving: 'Ajout…',
    invalidUrl: 'Ce lien ne ressemble pas à une URL valide.',
    sessionExpired: 'Session expirée. Reconnecte-toi depuis /admin.',
    saveFailed: 'Ce lien existe déjà ou n’a pas pu être enregistré.',
    networkError: 'Enregistrement impossible. Vérifie ta connexion.',
  },
  tagPicker: {
    composerLabel: 'Tags à associer au lien',
    cardLabel: 'Modifier les tags de ce lien',
    noTags: 'Aucun tag pour l’instant. Créez-en dans /admin.',
    openLabel: 'Modifier les tags',
    saveFailed: 'Les tags n’ont pas pu être enregistrés.',
  },
  grid: {
    emptyState: 'Aucun lien publié pour l’instant.',
    emptyFilteredState: 'Aucun lien avec ce tag pour l’instant.',
  },
}

const VEILLE_CONTENT: Record<Locale, VeilleContent> = { en, fr }

export function getVeilleContent(locale: Locale): VeilleContent {
  return VEILLE_CONTENT[locale]
}
