import { Analytics } from '@vercel/analytics/next'
import { Inter } from 'next/font/google'

import { MotionProvider } from '@/components/motion/motion-provider'
import { SiteShell } from '@/components/site-shell'
import { ThemeProvider } from '@/components/theme-provider'

import type { Metadata, Viewport } from 'next'

import '../globals.css'

// Self-hosted by next/font at build time: no third-party request, no layout shift.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

// First name only: that is how the site introduces itself. The full name shows
// up on the legal notice page alone, where the law requires it.
const TITLE = 'Adem — Senior Frontend Developer'
const DESCRIPTION =
  'Développeur frontend senior en Île-de-France. Interfaces React et Next.js rapides, accessibles et maintenables.'

export const metadata: Metadata = {
  // The final domain is not settled yet: it comes from the environment rather
  // than being hardcoded, and falls back to the development URL.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
  title: { default: TITLE, template: '%s — Adem' },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website' },
}

// `themeColor` matches the light `--bg`, the theme served by default.
export const viewport: Viewport = { colorScheme: 'light dark', themeColor: '#fbfdfe' }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // `data-scroll-behavior` declares that the smooth scrolling in `globals.css`
  // is intentional: without it, Next warns that a navigation might be animated
  // by accident.
  //
  // `suppressHydrationWarning` is required by next-themes: its inline script
  // writes `data-theme` before hydration, which React would otherwise report.
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <MotionProvider>
            <SiteShell>{children}</SiteShell>
          </MotionProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
