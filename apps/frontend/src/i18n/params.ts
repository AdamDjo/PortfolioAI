import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'

import { routing, type Locale } from '@/i18n/routing'

/**
 * Narrows the `[locale]` route param to a supported locale.
 *
 * Next types a route param as `string`, while next-intl's typed APIs want a
 * `Locale`, so the value has to be checked once per page rather than cast. The
 * segment also behaves like a catch-all for unmatched paths, which is the case
 * that would otherwise reach a message lookup with something like `favicon.ico`.
 *
 * An unsupported value 404s: the proxy only ever routes known locales, so
 * anything else is a hand-typed URL.
 */
export async function getPageLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  return locale
}
