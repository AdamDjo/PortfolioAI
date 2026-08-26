'use client'

import { createContext, useContext } from 'react'

import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config'

import type { ReactNode } from 'react'

/**
 * Carries the active locale to Client Components.
 *
 * Server Components read the locale from `next/root-params`, but a Client
 * Component cannot: it reads it here instead. The provider is rendered once, at
 * the `[lang]` layout, so any client island below — a locale-aware link, the
 * language switcher, the assistant hook — sees the same value without it being
 * threaded through props.
 */
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}
