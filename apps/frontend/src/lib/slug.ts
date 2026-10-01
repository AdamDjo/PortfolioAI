/**
 * The one slug rule for every document whose identifier appears in a URL.
 *
 * It lives in `lib` rather than in a collection because two collections now
 * depend on it — `tags`, whose slug drives the veille filters, and `posts`,
 * whose slug *is* the article's address. Two copies of this function would
 * eventually disagree, and the unique index would then reject a save with no
 * explanation of which existing document it collided with.
 *
 * Diacritics are stripped rather than encoded: `Accessibilité` has to reach the
 * URL as `accessibilite`, not as a percent-escaped sequence nobody can read in
 * a shared link.
 */
const toSlug = (value: string): string =>
  value
    .normalize('NFD')
    // Combining marks left behind by the decomposition above.
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export { toSlug }
