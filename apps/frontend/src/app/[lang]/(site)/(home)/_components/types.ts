/**
 * Props the home page sends across the server/client boundary.
 *
 * Narrower than the `ProjectView` / `BookmarkView` the data layer returns: every
 * field listed here is serialised into the HTML and resent on each RSC
 * navigation, so the page passes only what its components actually read.
 */

export interface HomeProject {
  id: string
  url: string
  title: string
  description: string | null
  imageUrl: string | null
  technologies: string[]
}

export interface HomeBookmark {
  id: string
  title: string
  /** First tag when the bookmark has one, falling back to its domain. */
  label: string
}

/** Availability as the hero badge renders it. */
export interface HomeAvailability {
  available: boolean
  label: string
}
