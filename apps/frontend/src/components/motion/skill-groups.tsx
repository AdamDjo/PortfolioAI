'use client'

import { Bot, Database, LayoutTemplate, Palette, ShieldCheck, Sparkles } from 'lucide-react'
import { m } from 'motion/react'

import { riseItem, staggerContainer } from '@/components/motion/primitives'

import type { SkillGroupView } from '@/lib/site-content'
import type { LucideIcon } from 'lucide-react'

/**
 * Compétences présentées par domaine, sans niveau chiffré.
 *
 * Ce composant remplace les anciennes barres de progression : un pourcentage de
 * maîtrise se lit comme une mesure alors qu'il n'en est pas une. Une liste
 * d'outils par domaine dit la même chose et reste vérifiable.
 *
 * Le balisage est une liste de définitions — le domaine est le terme, les outils
 * sa définition — plutôt que les primitives `Stagger` génériques, qui rendraient
 * des `div` entre `dl` et `dt` et casseraient cette sémantique.
 */

const VIEWPORT = { once: true, margin: '0px 0px -14% 0px' } as const

/**
 * Icône par domaine.
 *
 * Les libellés viennent de Payload et restent éditables : la table est indexée sur
 * un mot-clé contenu dans le libellé, pas sur une égalité stricte, et tout domaine
 * non reconnu retombe sur une icône neutre. Renommer un groupe dans l'admin ne peut
 * donc pas casser l'affichage.
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
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </m.div>
        )
      })}
    </m.dl>
  )
}
