'use client'

import { Menu, X } from 'lucide-react'
import { m } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { LanguageSwitcher } from '@/components/language-switcher'
import { Link, usePathname } from '@/i18n/navigation'

/**
 * Paths are the ones the app is written with, without a locale prefix: the
 * `Link` and `usePathname` from `@/i18n/navigation` add and strip it, so the
 * active check compares like with like.
 */
const NAV_ITEMS = [
  { href: '/', key: 'home' },
  { href: '/projets', key: 'projects' },
  { href: '/veille', key: 'veille' },
  { href: '/outils-ia', key: 'tools' },
  { href: '/a-propos', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const

/**
 * Primary navigation and its mobile trigger.
 *
 * The links and the burger button are one component because they share the open
 * state: below 900px the trigger is what shows the list. Splitting them would
 * mean lifting that state into a context for no gain.
 *
 * The trigger renders after the links in the DOM but is placed in the header's
 * action group by the parent, which passes it through as a separate slot.
 */
export function SiteNav({ actions }: { actions: React.ReactNode }) {
  const t = useTranslations('Nav')
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label={t('label')}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              aria-current={active ? 'page' : undefined}
              className={active ? 'nav-link is-active' : 'nav-link'}
              href={item.href}
              key={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {active ? (
                <m.span
                  className="nav-pill"
                  layoutId="nav-active-pill"
                  transition={{ type: 'spring', bounce: 0.16, duration: 0.55 }}
                  aria-hidden="true"
                />
              ) : null}
              <span className="active-dot" aria-hidden="true" />
              <span className="nav-label">{t(item.key)}</span>
            </Link>
          )
        })}
      </nav>
      <div className="header-actions">
        <LanguageSwitcher />
        {actions}
        <button
          className="icon-link menu-trigger"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={t('openMenu')}
          aria-expanded={menuOpen}
          type="button"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </>
  )
}
