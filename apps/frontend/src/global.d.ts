import type messages from '../messages/en.json'
import type { routing } from '@/i18n/routing'

/**
 * Makes message keys and locales type-safe across the app.
 *
 * `useTranslations('Home.hero')` then autocompletes its keys, and a typo or a key
 * removed from the catalogue fails the type check instead of rendering a raw key
 * string at runtime. English is the reference catalogue: every other locale is
 * checked against it by `messages.test.ts`.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: typeof messages
  }
}
