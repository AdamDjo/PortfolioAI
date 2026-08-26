import { notFound } from 'next/navigation'

import { isLocale, type Locale } from '@/lib/i18n/config'

/**
 * Narrows the `[lang]` route param to a supported locale.
 *
 * The locale is read from `params` and handed down explicitly rather than
 * fetched from ambient state. `next/root-params` would remove the plumbing, but
 * it only works when *every* route sits under the dynamic segment, and Payload
 * owns `/admin` and `/api` outside it — so `lang` is not a root param here.
 * Reading it from `headers()` instead would opt every page out of static
 * rendering, which is a steep price for saving a prop.
 *
 * An unsupported value 404s rather than silently falling back: the proxy only
 * ever routes known locales, so anything else is a hand-typed URL.
 */
export async function resolveLocale(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  return lang
}
