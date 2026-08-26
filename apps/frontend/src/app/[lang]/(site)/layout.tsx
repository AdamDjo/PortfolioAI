import { MotionProvider } from '@/components/motion/motion-provider'
import { SiteShell } from '@/components/site-shell'
import { resolveLocale } from '@/lib/i18n/server'

/**
 * The public site frame.
 *
 * The document shell (`<html>`, fonts, theme bootstrap, locale provider) lives
 * one level up in the `[lang]` layout, which every localized tree shares. What
 * remains here is what belongs to the public site specifically: the header,
 * footer and motion context that Payload's admin, in its own route group, must
 * not inherit.
 */
export default async function SiteLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const locale = await resolveLocale(params)

  return (
    <MotionProvider>
      <SiteShell locale={locale}>{children}</SiteShell>
    </MotionProvider>
  )
}
