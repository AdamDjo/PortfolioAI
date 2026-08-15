import { SiteShell } from '@/components/site-shell'

import type { Metadata, Viewport } from 'next'

import './globals.css'

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
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.dataset.theme=localStorage.getItem('adem-theme')||'dark'}catch(e){document.documentElement.dataset.theme='dark'}",
          }}
        />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
