import { Github, Linkedin } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { AmbientField } from '@/components/motion/ambient-field'
import { SiteHeaderShell } from '@/components/site-header-shell'
import { SiteNav } from '@/components/site-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { Link } from '@/i18n/navigation'
import { getIdentity } from '@/lib/site-content'

import type { ReactNode } from 'react'

/**
 * Header, footer and page frame shared by every route.
 *
 * A server component: only the three pieces that need browser state are client
 * islands — `SiteNav` for the active link and the mobile menu, `ThemeToggle` for
 * the theme, `SiteHeaderShell` for the entry animation. The wordmark, the social
 * links and the whole footer never reach the browser as JavaScript.
 */
export async function SiteShell({ children }: { children: ReactNode }) {
  const [tLayout, tFooter, identity] = await Promise.all([
    getTranslations('Layout'),
    getTranslations('Footer'),
    getIdentity(),
  ])
  const { role, location, githubUrl, linkedinUrl } = identity

  return (
    <>
      <a className="skip-link" href="#main-content">
        {tLayout('skipLink')}
      </a>
      <AmbientField />
      <SiteHeaderShell>
        <div className="shell header-inner">
          <Link className="wordmark" href="/">
            ADEM<span>.</span>
          </Link>
          <SiteNav
            actions={
              <>
                {githubUrl ? (
                  <a
                    className="icon-link hide-mobile"
                    href={githubUrl}
                    aria-label="GitHub"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    <Github size={17} strokeWidth={1.7} />
                  </a>
                ) : null}
                {linkedinUrl ? (
                  <a
                    className="icon-link hide-mobile"
                    href={linkedinUrl}
                    aria-label="LinkedIn"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    <Linkedin size={17} strokeWidth={1.7} />
                  </a>
                ) : null}
                <ThemeToggle />
              </>
            }
          />
        </div>
      </SiteHeaderShell>
      <main className="site-shell-content" id="main-content">
        {children}
      </main>
      <footer className="site-footer site-shell-content">
        <div className="shell footer-inner">
          <span className="wordmark wordmark-small">
            ADEM<span>.</span>
          </span>
          <p>
            {role}
            {location ? ` · ${location}` : ''}
          </p>
          <div className="footer-links">
            <Link href="/contact">{tFooter('contact')}</Link>
            <Link href="/confidentialite">{tFooter('privacy')}</Link>
            <Link href="/mentions-legales">{tFooter('legal')}</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
