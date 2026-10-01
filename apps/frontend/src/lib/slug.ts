/**
 * Turns a name into the identifier that appears in a URL.
 *
 * Shared rather than inlined in each collection hook: the veille page needs the
 * *same* rule to tell whether a typed name already exists, and articles derive
 * their address from their title with it. Two copies drifting apart would let
 * the page offer to create a tag that the unique index then rejects — so the
 * rule lives here and every side imports it.
 */
const toSlug = (name: string): string =>
  name
    .normalize('NFD')
    // Strips diacritics: "Accessibilité" becomes "accessibilite".
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export { toSlug }
