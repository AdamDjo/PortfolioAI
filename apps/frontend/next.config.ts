import bundleAnalyzer from '@next/bundle-analyzer'
import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

import type { NextConfig } from 'next'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// Points next-intl at the request config; without it the plugin looks for
// `./i18n/request.ts` at the project root rather than under `src/`.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/**
 * Content Security Policy, applied to every route.
 *
 * `script-src`/`style-src` keep `'unsafe-inline'` because Next injects inline
 * bootstrap scripts and Payload's admin ships inline styles, and neither carries
 * a nonce without a middleware that rewrites every response. `'unsafe-eval'` is
 * kept for the same reason on the admin side. Tightening these to a nonce-based
 * policy is a deliberate follow-up (#66); what this policy buys today is the rest
 * of the surface:
 *   - `frame-ancestors 'none'` — the admin login can no longer be framed
 *     (clickjacking), the concrete risk the audit named.
 *   - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` — no plugin
 *     injection, no base-tag hijack, no form posting to a foreign origin.
 *   - `img-src` allows any `https:` host because bookmark previews, favicons and
 *     project covers are rendered `unoptimized`, i.e. straight from the source.
 *     Everything else is pinned to the origin.
 *
 * Groq and Lumail are called server-side, so they never appear in `connect-src`;
 * Vercel Analytics and Speed Insights load and beacon same-origin; `next/font`
 * self-hosts Inter at build time — so no third-party host is needed anywhere.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

/**
 * Security headers for every response.
 *
 * These are pure hardening: none of them changes what the app renders, so they
 * are safe to apply globally. `X-Frame-Options` duplicates `frame-ancestors` for
 * browsers that predate CSP Level 2.
 */
const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  // Only honoured over HTTPS, inert on plain HTTP: safe to send everywhere.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  headers: () => Promise.resolve([{ source: '/:path*', headers: securityHeaders }]),

  experimental: {
    /*
     * Inlines the route's CSS into the HTML instead of linking it.
     *
     * The stylesheet is a single ~15 KB file that blocks the first render, so
     * the browser cannot paint until a second round trip completes. Inlined, the
     * first response carries everything the first paint needs. `style-src` in
     * the CSP above already allows `'unsafe-inline'`, so no policy change is
     * required.
     */
    inlineCss: true,
  },

  images: {
    /*
     * AVIF first, WebP as the fallback.
     *
     * The hero mascot is the LCP element on every viewport, and its download is
     * what the metric waits on — on a throttled mobile connection the WebP
     * rendition alone took 1.4 s to arrive. AVIF cuts that payload by roughly a
     * third for the same visual result; browsers that do not accept it are still
     * served the WebP by content negotiation.
     */
    formats: ['image/avif', 'image/webp'],

    /*
     * 384 is prepended to Next's default device widths.
     *
     * `getWidths` keeps only the candidates at or above `deviceSizes[0]` times
     * the smallest `vw` in the `sizes` prop. With 640 as the floor, a hero image
     * declared `70vw` could not be offered anything below 640px wide — a 300px
     * slot on desktop still downloaded the 640px rendition. Adding a 384 step
     * lowers that floor without changing any of the larger renditions.
     */
    deviceSizes: [384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Next merges `deviceSizes` and `imageSizes` into the candidate list, so 384
    // is dropped from here to keep it from appearing twice in every srcset.
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
}

const composedConfig = withPayload(withBundleAnalyzer(withNextIntl(nextConfig)))

/**
 * Restricts Payload's client-hint headers to the admin.
 *
 * `withPayload` appends `Accept-CH`/`Vary`/`Critical-CH: Sec-CH-Prefers-Color-Scheme`
 * to `/:path*` so its admin can render in the visitor's colour scheme on the
 * server. `Critical-CH` is not a hint, it is an order: a browser that did not
 * send the hint on its first request **restarts the navigation** to send it. On
 * the public site that costs a full extra round trip on every cold visit — 600 ms
 * on a throttled mobile connection — for a hint no public page reads.
 *
 * The entry also carries Payload's `X-Powered-By`, which the public site has no
 * reason to advertise either, so the whole block moves to the admin at once.
 */
const config: NextConfig = {
  ...composedConfig,
  headers: async () => {
    const entries = (await composedConfig.headers?.()) ?? []
    return entries.map((entry) =>
      entry.headers.some((header) => header.key === 'Critical-CH')
        ? { ...entry, source: '/admin/:path*' }
        : entry
    )
  },
}

export default config
