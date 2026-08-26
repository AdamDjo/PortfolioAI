import { NextResponse } from 'next/server'

import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from '@/lib/i18n/config'

import type { NextRequest } from 'next/server'

/**
 * Locale negotiation for the public site.
 *
 * Every public route lives under `/[lang]`, so a request without a locale
 * segment is redirected to the visitor's best match before it reaches a route.
 * The choice is sticky: the picked locale is written to a cookie that a later
 * bare request reuses, so a visitor who switched to French is not bounced back
 * to English by their browser's `Accept-Language` on the next navigation.
 *
 * Payload owns `/admin` and `/api`, which are never localized and must keep
 * their exact paths — the matcher and the guards below leave them untouched.
 */

const LOCALE_COOKIE = 'adem-locale'

/**
 * Paths that must never receive a locale prefix: Payload's admin and API, the
 * Next internals, and the well-known files served from the app root.
 */
const RESERVED_PREFIXES = ['/admin', '/api', '/_next', '/_vercel']
const RESERVED_FILES = new Set([
  '/favicon.ico',
  '/icon.svg',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.webmanifest',
])

function isReserved(pathname: string): boolean {
  if (RESERVED_FILES.has(pathname)) return true
  if (RESERVED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)))
    return true
  // Any request for a concrete file (has an extension in its last segment) is an
  // asset, not a page — never prefix it.
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1)
  return lastSegment.includes('.')
}

/**
 * Picks a locale from `Accept-Language`, matching on the primary subtag only.
 *
 * Two locales, hand-rolled rather than pulling in a matcher library: the header
 * is a comma list of `lang;q=weight` entries, already ordered by preference by
 * every browser, so the first entry whose base language we support wins.
 */
function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null

  for (const part of header.split(',')) {
    const tag = part.split(';', 1)[0]?.trim().toLowerCase()
    if (!tag) continue
    const base = tag.split('-', 1)[0]
    const match = LOCALES.find((locale) => locale === base)
    if (match) return match
  }
  return null
}

function resolveLocale(request: NextRequest): Locale {
  const cookieValue = request.cookies.get(LOCALE_COOKIE)?.value
  if (isLocale(cookieValue)) return cookieValue

  return localeFromAcceptLanguage(request.headers.get('accept-language')) ?? DEFAULT_LOCALE
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  if (isReserved(pathname)) return NextResponse.next()

  const firstSegment = pathname.split('/', 2)[1]
  if (isLocale(firstSegment)) {
    // Already localized: keep the cookie aligned with the URL the visitor is on,
    // so their explicit choice survives a later bare request.
    const response = NextResponse.next()
    if (request.cookies.get(LOCALE_COOKIE)?.value !== firstSegment) {
      response.cookies.set(LOCALE_COOKIE, firstSegment, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
    }
    return response
  }

  const locale = resolveLocale(request)
  const redirectUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
  redirectUrl.search = request.nextUrl.search

  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  return response
}

export const config = {
  // Skip Next internals up front; the guards above handle the rest so the proxy
  // stays a single source of truth for what "reserved" means.
  matcher: ['/((?!_next/static|_next/image).*)'],
}
