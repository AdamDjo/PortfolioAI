'use client'

import { FileText, FolderOpen, Route } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { HOME_CONTENT } from '@/app/(site)/(home)/_content'

const RAIL_ITEMS = [
  { ...HOME_CONTENT.rail[0], href: null, icon: null },
  { ...HOME_CONTENT.rail[1], href: '/projets', icon: FolderOpen },
  { ...HOME_CONTENT.rail[2], href: '/a-propos', icon: Route },
  { ...HOME_CONTENT.rail[3], href: '/contact', icon: FileText },
] as const

export function HomeRail({ onStartChat }: { onStartChat: () => void }) {
  return (
    <nav className="home-rail shell" aria-label="Raccourcis de la page d’accueil">
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
              <strong>{item.title}</strong>
              <small>{item.description}</small>
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
