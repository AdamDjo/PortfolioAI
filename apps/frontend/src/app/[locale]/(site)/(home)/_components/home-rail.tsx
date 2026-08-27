'use client'

import { FileText, FolderOpen, Route } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

/**
 * Destination, icon and copy keys travel together: pairing them by index across
 * separate lists would let a reordered catalogue point a label at the wrong page.
 */
const RAIL_ITEMS = [
  {
    id: 'assistant',
    href: null,
    icon: null,
    title: 'assistantTitle',
    description: 'assistantDescription',
  },
  {
    id: 'projects',
    href: '/projets',
    icon: FolderOpen,
    title: 'projectsTitle',
    description: 'projectsDescription',
  },
  {
    id: 'journey',
    href: '/a-propos',
    icon: Route,
    title: 'journeyTitle',
    description: 'journeyDescription',
  },
  {
    id: 'contact',
    href: '/contact',
    icon: FileText,
    title: 'contactTitle',
    description: 'contactDescription',
  },
] as const

export function HomeRail({ onStartChat }: { onStartChat: () => void }) {
  const t = useTranslations('Home.rail')

  return (
    <nav className="home-rail shell" aria-label={t('label')}>
      {RAIL_ITEMS.map((item, index) => {
        const Icon = item.icon
        const content = (
          <>
            <span className={`home-rail-icon${index === 0 ? ' is-avatar' : ''}`} aria-hidden="true">
              {Icon ? (
                <Icon size={30} strokeWidth={1.45} />
              ) : (
                <Image
                  src="/images/adem-assistant-avatar.webp"
                  alt=""
                  width={256}
                  height={256}
                  sizes="48px"
                />
              )}
            </span>
            <span>
              <strong>{t(item.title)}</strong>
              <small>{t(item.description)}</small>
            </span>
          </>
        )

        return item.href ? (
          <Link className="home-rail-item" href={item.href} key={item.id}>
            {content}
          </Link>
        ) : (
          <button
            className="home-rail-item is-active"
            key={item.id}
            onClick={onStartChat}
            type="button"
          >
            {content}
            {index === 0 ? <span className="home-rail-underline" /> : null}
          </button>
        )
      })}
    </nav>
  )
}
