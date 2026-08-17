'use client'

import { Github, Linkedin, Menu, Moon, Sun, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { AmbientField } from '@/components/motion/ambient-field'
import { EASE_OUT_QUINT } from '@/components/motion/primitives'

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/projets', label: 'Projets' },
  { href: '/veille', label: 'Veille' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
]

const DarkModeContext = createContext(true)

export function useDarkMode() {
  return useContext(DarkModeContext)
}

/**
 * Coordonnées affichées dans l'en-tête et le pied de page.
 *
 * Elles arrivent en props depuis le layout serveur : ce composant est client (il
 * gère le thème et le menu) et ne peut donc pas interroger Payload lui-même.
 */
interface SiteShellIdentity {
  role: string
  location: string | null
  githubUrl: string | null
  linkedinUrl: string | null
}

export function SiteShell({
  children,
  identity,
}: {
  children: ReactNode
  identity: SiteShellIdentity
}) {
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('adem-theme')
    const nextDarkMode = savedTheme ? savedTheme === 'dark' : true
    setDarkMode(nextDarkMode)
    document.documentElement.dataset.theme = nextDarkMode ? 'dark' : 'light'
  }, [])

  function toggleTheme() {
    setDarkMode((current) => {
      const next = !current
      document.documentElement.dataset.theme = next ? 'dark' : 'light'
      window.localStorage.setItem('adem-theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <DarkModeContext.Provider value={darkMode}>
      <a className="skip-link" href="#main-content">
        Aller au contenu
      </a>
      <AmbientField />
      <m.header
        className="site-header"
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT_QUINT }}
      >
        <div className="shell header-inner">
          <Link className="wordmark" href="/">
            ADEM<span>.</span>
          </Link>
          <nav
            className={menuOpen ? 'nav-links is-open' : 'nav-links'}
            aria-label="Navigation principale"
          >
            {navItems.map((item) => {
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
                  <span className="nav-label">{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="header-actions">
            {identity.githubUrl ? (
              <a
                className="icon-link hide-mobile"
                href={identity.githubUrl}
                aria-label="GitHub"
                rel="noreferrer noopener"
                target="_blank"
              >
                <Github size={17} strokeWidth={1.7} />
              </a>
            ) : null}
            {identity.linkedinUrl ? (
              <a
                className="icon-link hide-mobile"
                href={identity.linkedinUrl}
                aria-label="LinkedIn"
                rel="noreferrer noopener"
                target="_blank"
              >
                <Linkedin size={17} strokeWidth={1.7} />
              </a>
            ) : null}
            <button
              className="icon-link"
              onClick={toggleTheme}
              aria-label="Changer de thème"
              type="button"
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  className="theme-icon"
                  key={darkMode ? 'sun' : 'moon'}
                  initial={{ rotate: -70, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 70, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.22, ease: EASE_OUT_QUINT }}
                >
                  {darkMode ? (
                    <Sun size={18} strokeWidth={1.7} />
                  ) : (
                    <Moon size={18} strokeWidth={1.7} />
                  )}
                </m.span>
              </AnimatePresence>
            </button>
            <button
              className="icon-link menu-trigger"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              type="button"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </m.header>
      <main className="site-shell-content" id="main-content">
        {children}
      </main>
      <footer className="site-footer site-shell-content">
        <div className="shell footer-inner">
          <span className="wordmark wordmark-small">
            ADEM<span>.</span>
          </span>
          <p>
            {identity.role}
            {identity.location ? ` · ${identity.location}` : ''}
          </p>
          <div className="footer-links">
            <Link href="/contact">Me contacter</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </DarkModeContext.Provider>
  )
}
