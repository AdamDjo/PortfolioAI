import { hasLocale, type Messages } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

/**
 * Per-request i18n configuration: which locale, and the messages for it.
 *
 * The `[locale]` segment behaves like a catch-all, so an unknown value has to
 * fall back to the default rather than reach a message lookup — `hasLocale`
 * narrows it. Catalogues are imported dynamically so a request only ever loads
 * the language it serves; the import is typed against `Messages` (the English
 * catalogue, via `global.d.ts`) because a bare JSON import resolves to `any`.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  const catalogue = (await import(`../../messages/${locale}.json`)) as { default: Messages }

  return { locale, messages: catalogue.default }
})
