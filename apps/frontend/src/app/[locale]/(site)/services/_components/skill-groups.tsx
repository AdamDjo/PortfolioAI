'use client'

import { Bot, Database, LayoutTemplate, Palette, ShieldCheck, Sparkles } from 'lucide-react'
import { m } from 'motion/react'

import { riseItem, staggerContainer } from '@/components/motion/primitives'
import { TechnologyIcon } from '@/components/technology-icon'

import type { SkillGroupView } from '@/lib/site-content'
import type { LucideIcon } from 'lucide-react'

/**
 * Skills presented by domain, without a numeric level.
 *
 * This component replaces the former progress bars: a mastery percentage reads as
 * a measurement while being none. A list of tools per domain says the same thing
 * and stays verifiable.
 *
 * The markup is a definition list — the domain is the term, the tools its
 * definition — rather than the generic `Stagger` primitives, which would render
 * `div`s between `dl` and `dt` and break that semantics.
 */

const VIEWPORT = { once: true, margin: '0px 0px -14% 0px' } as const

/**
 * Icon per domain.
 *
 * Labels come from Payload and stay editable: the table is keyed on a keyword
 * contained in the label, not on strict equality, and any unrecognised domain
 * falls back to a neutral icon. Renaming a group in the admin therefore cannot
 * break the display.
 */
const DOMAIN_ICONS: readonly (readonly [RegExp, LucideIcon])[] = [
  [/front|react|web/i, LayoutTemplate],
  [/design|interface|ui/i, Palette],
  [/qualit|test|outil/i, ShieldCheck],
  [/back|donnée|data|base/i, Database],
  [/ia|ai\b|agent/i, Bot],
]

const iconFor = (label: string): LucideIcon =>
  DOMAIN_ICONS.find(([pattern]) => pattern.test(label))?.[1] ?? Sparkles

interface SkillGroupsProps {
  groups: SkillGroupView[]
  /**
   * Animate on mount instead of on scroll into view.
   *
   * The scroll trigger shrinks the viewport by 14% at the bottom to fire slightly
   * early. For a block that already sits in the first screen that margin works
   * against us: the items reserve their height while never entering the reduced
   * viewport, so the section reads as an empty hole until the visitor scrolls.
   */
  onMount?: boolean
}

export function SkillGroups({ groups, onMount }: SkillGroupsProps) {
  return (
    <m.dl
      className="skill-groups"
      initial="hidden"
      {...(onMount ? { animate: 'visible' } : { whileInView: 'visible', viewport: VIEWPORT })}
      variants={staggerContainer(0.08)}
    >
      {groups.map((group) => {
        const Icon = iconFor(group.label)

        return (
          <m.div className="skill-group" key={group.label} variants={riseItem}>
            <dt>
              <span className="skill-group-icon" aria-hidden="true">
                <Icon size={17} strokeWidth={1.8} />
              </span>
              {group.label}
            </dt>
            <dd>
              <ul className="skill-chips">
                {group.items.map((item) => (
                  <li key={item}>
                    <TechnologyIcon name={item} size={14} />
                    {item}
                  </li>
                ))}
              </ul>
            </dd>
          </m.div>
        )
      })}
    </m.dl>
  )
}
