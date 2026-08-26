import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

import type { Metadata } from 'next'

type Alternates = NonNullable<Metadata['alternates']>

/**
 * Canonical URL and `hreflang` alternates for one page.
 *
 * Each page exists once per locale at a distinct URL, so search engines need the
 * `languages` map to connect them and a canonical to name the one they are on.
 * `x-default` points at the default locale, which is what a visitor with no
 * matching language is served.
 *
 * Paths come from `getPathname`, the same helper the navigation uses, so a URL
 * here can never drift from the one a link points to.
 */
export function buildAlternates(locale: string, pathname: string): Alternates {
  const languages: Record<string, string> = {}
  for (const candidate of routing.locales) {
    languages[candidate] = getPathname({ href: pathname, locale: candidate })
  }
  languages['x-default'] = getPathname({ href: pathname, locale: routing.defaultLocale })

  return {
    canonical: getPathname({ href: pathname, locale: locale as (typeof routing.locales)[number] }),
    languages,
  }
}
