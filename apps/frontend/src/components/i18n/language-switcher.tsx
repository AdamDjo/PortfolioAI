'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useLocale } from '@/components/i18n/locale-context'
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT, isLocale, type Locale } from '@/lib/i18n/config'

const LOCALE_COOKIE = 'adem-locale'

/**
 * Swaps the current route to another locale while staying on the same page.
 *
 * The path always begins with a locale segment, so switching is a matter of
 * replacing that first segment and keeping the rest. The choice is persisted to
 * the same cookie the proxy reads, so a later bare request honours it instead of
 * falling back to `Accept-Language`.
 *
 * Rendered as a segmented control rather than a dropdown: with two languages the
 * whole choice is visible at once, and both targets are real links, so it works
 * without JavaScript and is crawlable for the alternate-language pages.
 */
function swapLocale(pathname: string, target: Locale): string {
  const segments = pathname.split('/')
  // segments[0] is the empty string before the leading slash; segments[1] is the
  // current locale when the path is localized.
  if (isLocale(segments[1])) {
    segments[1] = target
    return segments.join('/') || '/'
  }
  return `/${target}${pathname === '/' ? '' : pathname}`
}

export function LanguageSwitcher() {
  const active = useLocale()
  const pathname = usePathname()

  function persist(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
  }

  return (
    <div className="language-switcher" role="group" aria-label="Language">
      {LOCALES.map((locale) => {
        const isActive = locale === active
        return (
          <Link
            key={locale}
            href={swapLocale(pathname, locale)}
            hrefLang={locale}
            className={isActive ? 'language-option is-active' : 'language-option'}
            aria-current={isActive ? 'true' : undefined}
            aria-label={LOCALE_LABELS[locale]}
            onClick={() => persist(locale)}
          >
            {LOCALE_SHORT[locale]}
          </Link>
        )
      })}
    </div>
  )
}
