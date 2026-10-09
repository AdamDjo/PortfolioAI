import { BookMarked, Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

const TABS = [
  { href: '/veille', icon: BookMarked, labelKey: 'linksTab' },
  { href: '/veille/outils-ia', icon: Sparkles, labelKey: 'toolsTab' },
] as const

/**
 * Switches between the reading list and the AI tools.
 *
 * Each tab is its own route rather than a `?tab=` on one page: a query-only
 * navigation leaves the document title on the previous tab, and the tools can
 * stay prerendered while the links are rendered on demand.
 */
export async function VeilleTabs({ active }: { active: (typeof TABS)[number]['href'] }) {
  const t = await getTranslations('Veille')

  return (
    <nav className="section-tabs" aria-label={t('tabsLabel')}>
      {TABS.map(({ href, icon: Icon, labelKey }) => (
        <Link
          aria-current={href === active ? 'page' : undefined}
          className={href === active ? 'section-tab is-active' : 'section-tab'}
          href={href}
          key={href}
          scroll={false}
        >
          <Icon size={16} aria-hidden="true" />
          {t(labelKey)}
        </Link>
      ))}
    </nav>
  )
}
