/**
 * The set of languages the public site is served in.
 *
 * English is the default: it is what `/` negotiates to when nothing else
 * matches, and the locale Payload falls back to for any untranslated field. The
 * order here is the order the language switcher lists them in.
 */
export const LOCALES = ['en', 'fr'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/** Native label shown in the language switcher, one per locale. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
}

/** Short code shown on the compact switcher (e.g. in the header). */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/**
 * Prefixes an in-app path with a locale segment.
 *
 * Every public route lives under `/[lang]`, so an internal link built from a
 * bare path (`/projets`) has to gain its locale before it points anywhere real.
 * A path that already starts with a supported locale is left untouched, which
 * keeps the helper idempotent when a caller passes an already-localized href.
 */
export function localizePath(locale: Locale, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`

  const [maybeLocale] = normalized.slice(1).split('/', 1)
  if (isLocale(maybeLocale)) return normalized

  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`
}
