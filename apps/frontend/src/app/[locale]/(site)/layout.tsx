import { setRequestLocale } from 'next-intl/server'

import { MotionProvider } from '@/components/motion/motion-provider'
import { SiteShell } from '@/components/site-shell'
import { getPageLocale } from '@/i18n/params'

/**
 * The public site frame.
 *
 * The document shell (`<html>`, fonts, theme bootstrap, intl provider) lives one
 * level up in the `[locale]` layout, which every localized tree shares. What
 * remains here is what belongs to the public site specifically: the header,
 * footer and motion context that Payload's admin, in its own route group, must
 * not inherit.
 */
export default async function SiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const locale = await getPageLocale(params)
  setRequestLocale(locale)

  return (
    <MotionProvider>
      <SiteShell>{children}</SiteShell>
    </MotionProvider>
  )
}
