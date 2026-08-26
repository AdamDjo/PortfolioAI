'use client'

import NextLink from 'next/link'

import { useLocale } from '@/components/i18n/locale-context'
import { localizePath } from '@/lib/i18n/config'

import type { ComponentProps } from 'react'

type LinkProps = ComponentProps<typeof NextLink>

/**
 * A `next/link` that prefixes in-app paths with the active locale.
 *
 * Every internal link across the site keeps its bare href (`/projets`); this
 * wrapper turns it into `/en/projets` for the current locale, so navigation
 * stays inside the visitor's language without every call site knowing about it.
 * External URLs, anchors, `mailto:`/`tel:` and already-localized paths pass
 * through unchanged.
 */
function isInAppPath(href: LinkProps['href']): href is string {
  return typeof href === 'string' && href.startsWith('/')
}

export function LocaleLink({ href, ...props }: LinkProps) {
  const locale = useLocale()
  const resolved = isInAppPath(href) ? localizePath(locale, href) : href
  return <NextLink href={resolved} {...props} />
}
