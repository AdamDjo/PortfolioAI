'use client'

import { Menu, X } from 'lucide-react'
import { m } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { useLocale } from '@/components/i18n/locale-context'
import { localizePath } from '@/lib/i18n/config'

import type { UiMessages } from '@/lib/i18n/messages'

const NAV_ITEMS = [
  { href: '/', key: 'home' },
  { href: '/projets', key: 'projects' },
  { href: '/veille', key: 'veille' },
  { href: '/outils-ia', key: 'tools' },
  { href: '/a-propos', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const satisfies readonly { href: string; key: keyof UiMessages['nav'] }[]

/**
 * Primary navigation and its mobile trigger.
 *
 * The links and the burger button are one component because they share the open
 * state: below 900px the trigger is what shows the list. Splitting them would
 * mean lifting that state into a context for no gain.
 *
 * The trigger renders after the links in the DOM but is placed in the header's
 * action group by the parent, which passes it through as a separate slot.
 *
 * Hrefs are localized here rather than through `LocaleLink` because the active
 * check needs the resolved path anyway.
 */
export function SiteNav({
  actions,
  messages,
}: {
  actions: React.ReactNode
  messages: UiMessages['nav']
}) {
  const pathname = usePathname()
  const locale = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label={messages.label}>
        {NAV_ITEMS.map((item) => {
          const href = localizePath(locale, item.href)
          const active = pathname === href
          return (
            <Link
              aria-current={active ? 'page' : undefined}
              className={active ? 'nav-link is-active' : 'nav-link'}
              href={href}
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
              <span className="nav-label">{messages[item.key]}</span>
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
          aria-label={messages.openMenu}
          aria-expanded={menuOpen}
          type="button"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </>
  )
}
