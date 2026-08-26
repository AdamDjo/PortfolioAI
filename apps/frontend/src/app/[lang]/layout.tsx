import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import Script from 'next/script'

import { LocaleProvider } from '@/components/i18n/locale-context'
import { DEFAULT_LOCALE, LOCALES, isLocale, localizePath } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'

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
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const { meta } = getMessages(locale)

  const languages: Record<string, string> = {}
  for (const candidate of LOCALES) languages[candidate] = localizePath(candidate, '/')
  languages['x-default'] = localizePath(DEFAULT_LOCALE, '/')

  return {
    // The final domain is not settled yet: it comes from the environment rather
    // than being hardcoded, and falls back to the development URL.
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
    title: { default: meta.title, template: '%s — Adem' },
    description: meta.description,
    alternates: { canonical: localizePath(locale, '/'), languages },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      locale,
    },
  }
}

// `themeColor` matches the light `--bg`, the theme served by default.
export const viewport: Viewport = { colorScheme: 'light dark', themeColor: '#fbfdfe' }

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  // `data-scroll-behavior` declares that the smooth scrolling in `globals.css`
  // is intentional: without it, Next warns that a navigation might be animated
  // by accident.
  //
  // The beforeInteractive initializer writes `data-theme` before hydration.
  // React would otherwise report the expected server/client attribute mismatch.
  return (
    <html
      lang={lang}
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
        <LocaleProvider locale={lang}>{children}</LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
