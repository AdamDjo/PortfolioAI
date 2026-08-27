import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { buildAlternates } from '@/i18n/metadata'
import { getPageLocale } from '@/i18n/params'
import { routing } from '@/i18n/routing'

import type { Metadata, Viewport } from 'next'

import '../globals.css'

// Self-hosted by next/font at build time: no third-party request, no layout shift.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const THEME_INIT_SCRIPT = `
try {
  const storedTheme = localStorage.getItem('adem-theme')
  const theme = storedTheme === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
} catch {
  document.documentElement.dataset.theme = 'light'
  document.documentElement.style.colorScheme = 'light'
}
`

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const locale = await getPageLocale(params)
  const t = await getTranslations({ locale, namespace: 'Meta' })
  const title = t('title')
  const description = t('description')

  return {
    // The final domain is not settled yet: it comes from the environment rather
    // than being hardcoded, and falls back to the development URL.
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
    title: { default: title, template: '%s — Adem' },
    description,
    alternates: buildAlternates(locale, '/'),
    openGraph: { title, description, type: 'website', locale },
  }
}

// `themeColor` matches the light `--bg`, the theme served by default.
export const viewport: Viewport = { colorScheme: 'light dark', themeColor: '#fbfdfe' }

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const locale = await getPageLocale(params)

  // Opts this route out of dynamic rendering: without it, reading the locale
  // from the request would make every page render on demand.
  setRequestLocale(locale)

  // `data-scroll-behavior` declares that the smooth scrolling in `globals.css`
  // is intentional: without it, Next warns that a navigation might be animated
  // by accident.
  //
  // The beforeInteractive initializer writes `data-theme` before hydration.
  // React would otherwise report the expected server/client attribute mismatch.
  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-initializer" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
