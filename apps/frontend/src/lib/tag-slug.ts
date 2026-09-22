/**
 * Turns a tag name into its identifier.
 *
 * Shared rather than inlined in the collection hook: the veille page needs the
 * *same* rule to tell whether a typed name already exists. Two copies drifting
 * apart would let the page offer to create a tag that the unique index then
 * rejects — so the rule lives here and both sides import it.
 */
const toTagSlug = (name: string): string =>
  name
    .normalize('NFD')
    // Strips diacritics: "Accessibilité" becomes "accessibilite".
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export { toTagSlug }
