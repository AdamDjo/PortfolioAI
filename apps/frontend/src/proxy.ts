import createMiddleware from 'next-intl/middleware'

import { routing } from '@/i18n/routing'

/**
 * Locale negotiation for the public site.
 *
 * `next-intl` handles the whole flow from the shared routing config: it reads
 * the locale cookie, falls back to `Accept-Language`, redirects a bare path to
 * its prefixed form and sets `Link` alternate headers for search engines.
 *
 * Next 16 renamed the `middleware` convention to `proxy`; the handler itself is
 * unchanged, which is why a middleware factory is exported from this file.
 */
export default createMiddleware(routing)

export const config = {
  /*
   * Payload owns `/admin` and `/api` and neither is localized, so both stay out
   * of the matcher along with Next's internals and any path holding a file
   * extension (assets, `robots.txt`, `sitemap.xml`). What is left is exactly the
   * set of pages that carry a locale.
   */
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
}
