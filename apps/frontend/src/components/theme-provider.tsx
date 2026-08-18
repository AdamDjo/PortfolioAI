'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'

import type { ReactNode } from 'react'

/**
 * Applies the stored theme before the first paint.
 *
 * `next-themes` injects a blocking inline script that reads storage and writes
 * `data-theme` on `<html>`, which is what keeps the page from flashing the
 * default theme: the server cannot know the visitor's choice, so the value has
 * to be applied synchronously in the browser.
 *
 * `attribute="data-theme"` matches the selectors already in `globals.css`, where
 * light is the `:root` default and `[data-theme='dark']` is the exception.
 * `enableSystem` is off on purpose — the toggle is a deliberate binary choice,
 * and light is the default the site is designed around.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      storageKey="adem-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  )
}
