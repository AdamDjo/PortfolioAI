'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { LOCALE_LABELS, LOCALE_SHORT, routing } from '@/i18n/routing'

/**
 * Swaps the current route to another locale while staying on the same page.
 *
 * `usePathname` returns the path without its locale prefix, so the same value
 * points at every language: passing `locale` to `Link` is all it takes to build
 * the counterpart URL. next-intl writes the locale cookie on navigation, so the
 * choice survives a later visit to a bare path.
 *
 * Rendered as a segmented control rather than a dropdown: with two languages the
 * whole choice is visible at once, and both targets are real links, so it works
 * without JavaScript and is crawlable.
 */
export function LanguageSwitcher() {
  const active = useLocale()
  const pathname = usePathname()
  const t = useTranslations('Layout')

  return (
    <div className="language-switcher" role="group" aria-label={t('language')}>
      {routing.locales.map((locale) => {
        const isActive = locale === active
        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            hrefLang={locale}
            className={isActive ? 'language-option is-active' : 'language-option'}
            aria-current={isActive ? 'true' : undefined}
            aria-label={LOCALE_LABELS[locale]}
          >
            {LOCALE_SHORT[locale]}
          </Link>
        )
      })}
    </div>
  )
}
