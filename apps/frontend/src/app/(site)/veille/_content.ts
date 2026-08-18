/**
 * Static editorial copy and metadata for the veille page.
 *
 * The bookmarks themselves come from Payload instead — this file only holds
 * strings tied to the page's structure.
 */
export const VEILLE_CONTENT = {
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
} as const
