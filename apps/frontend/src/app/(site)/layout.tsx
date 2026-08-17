import { Inter } from 'next/font/google'

import { MotionProvider } from '@/components/motion/motion-provider'
import { SiteShell } from '@/components/site-shell'
import { getIdentity } from '@/lib/site-content'

import type { Metadata, Viewport } from 'next'

import '../globals.css'

// Self-hosted by next/font at build time: no third-party request, no layout shift.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const TITLE = 'Adem Ben Messaoud — Senior Frontend Developer'
const DESCRIPTION =
  'Développeur frontend senior en Île-de-France. Interfaces React et Next.js rapides, accessibles et maintenables.'

export const metadata: Metadata = {
  // Le domaine définitif n'est pas encore arrêté : il vient de l'environnement
  // plutôt que d'être écrit en dur, et retombe sur l'URL de développement.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
  title: { default: TITLE, template: '%s — Adem Ben Messaoud' },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website' },
}

export const viewport: Viewport = { colorScheme: 'light dark', themeColor: '#080a0f' }

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const identity = await getIdentity()

  // `data-scroll-behavior` déclare que le défilement doux de `globals.css` est
  // voulu : sans cet attribut, Next avertit qu'une navigation pourrait être
  // animée par accident.
  return (
    <html
      lang="fr"
      data-theme="dark"
      data-scroll-behavior="smooth"
      className={inter.variable}
      suppressHydrationWarning
    >
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
          <SiteShell
            identity={{
              role: identity.role,
              location: identity.location,
              githubUrl: identity.githubUrl,
              linkedinUrl: identity.linkedinUrl,
            }}
          >
            {children}
          </SiteShell>
        </MotionProvider>
      </body>
    </html>
  )
}
