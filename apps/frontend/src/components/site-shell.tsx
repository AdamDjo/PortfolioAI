'use client'

import { Github, Linkedin, Menu, Moon, Sun, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

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

export function SiteShell({ children }: { children: ReactNode }) {
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
      <header className="site-header">
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
                  <span className="active-dot" aria-hidden="true" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="header-actions">
            <a className="icon-link hide-mobile" href="https://github.com" aria-label="GitHub">
              <Github size={17} strokeWidth={1.7} />
            </a>
            <a className="icon-link hide-mobile" href="https://linkedin.com" aria-label="LinkedIn">
              <Linkedin size={17} strokeWidth={1.7} />
            </a>
            <button
              className="icon-link"
              onClick={toggleTheme}
              aria-label="Changer de thème"
              type="button"
            >
              {darkMode ? (
                <Sun size={18} strokeWidth={1.7} />
              ) : (
                <Moon size={18} strokeWidth={1.7} />
              )}
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
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="shell footer-inner">
          <span className="wordmark wordmark-small">
            ADEM<span>.</span>
          </span>
          <p>Frontend engineer basé en France.</p>
          <div className="footer-links">
            <Link href="/contact">Me contacter</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </DarkModeContext.Provider>
  )
}
