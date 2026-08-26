import { DEFAULT_LOCALE, LOCALES, localizePath, type Locale } from '@/lib/i18n/config'

import type { Metadata } from 'next'

interface PageMetadataInput {
  locale: Locale
  /** The route's bare path, without locale prefix (e.g. `/projets` or `/`). */
  path: string
  title?: string
  description?: string
}

/**
 * Metadata common to every localized page: canonical URL and `hreflang`
 * alternates.
 *
 * Each page exists once per locale at a distinct URL, so search engines need the
 * `alternates.languages` map to connect them and a canonical to name the one
 * they are on. `x-default` points at the default locale, which is what a visitor
 * with no matching language is served. Resolved against `metadataBase` from the
 * root layout.
 */
export function buildPageMetadata({
  locale,
  path,
  title,
  description,
}: PageMetadataInput): Metadata {
  const languages: Record<string, string> = {}
  for (const candidate of LOCALES) {
    languages[candidate] = localizePath(candidate, path)
  }
  languages['x-default'] = localizePath(DEFAULT_LOCALE, path)

  const metadata: Metadata = {
    alternates: {
      canonical: localizePath(locale, path),
      languages,
    },
  }

  if (title !== undefined) metadata.title = title
  if (description !== undefined) metadata.description = description
  if (title !== undefined || description !== undefined) {
    metadata.openGraph = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
    }
  }

  return metadata
}
