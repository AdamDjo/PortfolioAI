'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

/**
 * Switches between the light and dark themes.
 *
 * Both icons are always rendered and CSS picks the visible one from
 * `data-theme`, set before the first paint by the `next-themes` script. Choosing
 * in JS would require waiting for mount to stay hydration-safe, which is exactly
 * what makes the icon pop in after the header has painted.
 */
export function ThemeToggle() {
  const { setTheme } = useTheme()

  /*
   * Reads the current theme from the setter rather than from `resolvedTheme`, so
   * this component never subscribes to the theme value: nothing here renders
   * differently per theme, and subscribing would re-render on every toggle for
   * no visible gain.
   */
  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
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
