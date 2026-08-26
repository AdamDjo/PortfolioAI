'use client'

import { FileText, FolderOpen, Route } from 'lucide-react'
import Image from 'next/image'

import { getHomeContent } from '@/app/[lang]/(site)/(home)/_content'
import { useLocale } from '@/components/i18n/locale-context'
import { LocaleLink } from '@/components/i18n/locale-link'

// Destinations pair with the copy by position: the rail's shape is structural,
// only its wording is translated.
const RAIL_TARGETS = [
  { href: null, icon: null },
  { href: '/projets', icon: FolderOpen },
  { href: '/a-propos', icon: Route },
  { href: '/contact', icon: FileText },
] as const

export function HomeRail({ onStartChat }: { onStartChat: () => void }) {
  const { rail, railLabel } = getHomeContent(useLocale())

  return (
    <nav className="home-rail shell" aria-label={railLabel}>
      {rail.map((copy, index) => {
        const item = { ...copy, ...RAIL_TARGETS[index] }
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
              <strong>{item.title}</strong>
              <small>{item.description}</small>
            </span>
          </>
        )

        return item.href ? (
          <LocaleLink className="home-rail-item" href={item.href} key={item.id}>
            {content}
          </LocaleLink>
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
