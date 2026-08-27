import { createNavigation } from 'next-intl/navigation'

import { routing } from './routing'

/**
 * Locale-aware replacements for the `next/navigation` primitives.
 *
 * Components link with a bare path (`/projets`) and these helpers add the active
 * locale, so no call site carries the prefix. `usePathname` mirrors that: it
 * returns the path *without* the locale, which is what an active-link check
 * should compare against.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
