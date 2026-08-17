import { Inter } from 'next/font/google'

import { MotionProvider } from '@/components/motion/motion-provider'
import { SiteShell } from '@/components/site-shell'

import type { Metadata, Viewport } from 'next'

import '../globals.css'

// Self-hosted by next/font at build time: no third-party request, no layout shift.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://adem.dev'),
  title: { default: 'Adem — Frontend engineer', template: '%s — Adem' },
  description:
    'Frontend engineer en France. Interfaces rapides, accessibles et soignées avec React, Next.js et TypeScript.',
  openGraph: {
    title: 'Adem — Frontend engineer',
    description: 'Des interfaces modernes, performantes et accessibles.',
    type: 'website',
  },
}

export const viewport: Viewport = { colorScheme: 'light dark', themeColor: '#080a0f' }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" data-theme="dark" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.dataset.theme=localStorage.getItem('adem-theme')||'dark'}catch(e){document.documentElement.dataset.theme='dark'}",
          }}
        />
      </head>
      <body>
        <MotionProvider>
          <SiteShell>{children}</SiteShell>
        </MotionProvider>
      </body>
    </html>
  )
}
