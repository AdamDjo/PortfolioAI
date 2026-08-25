import bundleAnalyzer from '@next/bundle-analyzer'
import { withPayload } from '@payloadcms/next/withPayload'

import type { NextConfig } from 'next'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

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
}

export default withPayload(withBundleAnalyzer(nextConfig))
