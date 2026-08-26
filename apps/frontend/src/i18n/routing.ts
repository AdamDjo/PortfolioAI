import { defineRouting } from 'next-intl/routing'

/**
 * The single source of truth for locales and URL shape.
 *
 * `next-intl` reads this in the proxy, the navigation helpers and the request
 * config, so a locale is added in exactly one place.
 *
 * `localePrefix: 'always'` keeps every language on its own prefix, English
 * included: `/` never serves content directly, so the default locale has a
 * canonical URL of its own instead of two addresses for the same page.
 */
export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeCookie: {
    name: 'adem-locale',
    sameSite: 'lax',
    // A year: the visitor's choice should outlive the session, and the value is
    // a language tag, so nothing here is worth a shorter window.
    maxAge: 60 * 60 * 24 * 365,
  },
})

export type Locale = (typeof routing.locales)[number]

/** Native label for the language switcher, one per locale. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
}

/** Short code shown on the compact switcher in the header. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
}
