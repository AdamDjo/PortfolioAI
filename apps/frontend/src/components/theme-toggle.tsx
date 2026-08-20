'use client'

import { Moon, Sun } from 'lucide-react'

const THEME_STORAGE_KEY = 'adem-theme'

/**
 * Switches between the light and dark themes.
 *
 * Both icons are always rendered and CSS picks the visible one from
 * `data-theme`, set before hydration by the root layout initializer. Choosing in
 * JS would require waiting for mount to stay hydration-safe, which is exactly
 * what makes the icon pop in after the header has painted.
 */
export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark'

    root.dataset.theme = nextTheme
    root.style.colorScheme = nextTheme

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // The visual toggle still works when storage is unavailable.
    }
  }

  return (
    <button className="icon-link" onClick={toggleTheme} aria-label="Changer de thème" type="button">
      <span className="theme-icon">
        <Moon className="theme-icon-light" size={18} strokeWidth={1.7} />
        <Sun className="theme-icon-dark" size={18} strokeWidth={1.7} />
      </span>
    </button>
  )
}
