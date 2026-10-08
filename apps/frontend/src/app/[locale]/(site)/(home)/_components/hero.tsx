import {
  ArrowRight,
  GitBranchPlus,
  MapPin,
  MessageCircle,
  Rocket,
  Sparkles,
  Star,
} from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Stagger, StaggerItem } from '@/components/motion/primitives'
import { TechnologyIcon } from '@/components/technology-icon'
import { Link } from '@/i18n/navigation'

import { AvailabilityBadge } from './availability-badge'
import { HeroChat } from './hero-chat'

import type { HomeAvailability } from './types'

// Product names, identical in every language: they belong in code, not in a
// translation catalogue where each locale would repeat them verbatim.
const SKILL_FALLBACK = ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js']
interface HeroProps {
  name: string
  role: string
  location: string | null
  yearsOfExperience: number | null
  projectCount: number
  skills: string[]
  availability: HomeAvailability
  retentionNotice: string
}

/**
 * The hero, rendered on the server.
 *
 * Copy, mascot, profile and skills cards and stats never change after the page
 * is built, so they ship as HTML only; `HeroChat` is the one client island. Its
 * icons (`simple-icons`) and most of `lucide-react` stay out of the browser.
 */
export async function Hero({
  name,
  role,
  location,
  yearsOfExperience,
  projectCount,
  skills,
  availability,
  retentionNotice,
}: HeroProps) {
  const t = await getTranslations('Home')
  const shownSkills = (skills.length > 0 ? skills : [...SKILL_FALLBACK]).slice(0, 5)

  return (
    <section className="home-hero shell" aria-labelledby="home-title">
      <Stagger className="home-hero-copy" stagger={0.08} delay={0.08} onMount>
        <StaggerItem variant="rise-visible">
          <AvailabilityBadge available={availability.available}>
            {availability.label}
          </AvailabilityBadge>
        </StaggerItem>

        <h1 className="home-hero-title" id="home-title">
          <span>{t('hero.titleLine1')}</span>
          <span>{t('hero.titleLine2')}</span>
          <span className="gradient-text">{t('hero.titleLine3')}</span>
        </h1>

        <StaggerItem variant="rise-visible">
          <p className="home-hero-lead">{t('hero.lead')}</p>
        </StaggerItem>

        <StaggerItem variant="rise-visible">
          <div className="home-hero-actions">
            {/* Same page: a plain fragment link, so the browser scrolls instead of navigating. */}
            <a className="button button-primary" href="#projects">
              {t('hero.primaryAction')} <ArrowRight size={16} />
            </a>
            <Link className="button button-secondary" href="/contact">
              {t('hero.secondaryAction')}
            </Link>
          </div>
        </StaggerItem>

        <StaggerItem variant="rise-visible">
          <ul className="home-tech-list" aria-label="Technologies principales">
            {shownSkills.slice(0, 4).map((skill) => (
              <li key={skill}>
                <TechnologyIcon name={skill} size={15} />
                {skill}
              </li>
            ))}
          </ul>
        </StaggerItem>

        {location ? (
          <StaggerItem variant="rise-visible">
            <p className="home-hero-location">
              <MapPin size={14} aria-hidden="true" /> {location}
            </p>
          </StaggerItem>
        ) : null}
      </Stagger>

      {/*
        The mascot is the hero's LCP element, so its entrance is CSS, not Framer
        Motion: a JS-driven fade kept the image at opacity 0 until hydration,
        pushing LCP past 4s. The CSS animation only moves it (opacity stays 1),
        so the browser paints it on the first frame. See home-mascot in _styles.
      */}
      <div className="home-mascot">
        <span className="home-mascot-doodle doodle-chat" aria-hidden="true">
          <MessageCircle size={28} />
        </span>
        <span className="home-mascot-doodle doodle-spark" aria-hidden="true">
          <Sparkles size={24} />
        </span>
        {/*
          `fetchPriority` is set explicitly on top of `priority`. In Next 16
          `priority` only emits the `<link rel="preload">`; it no longer forwards
          a priority hint, so both the preload and the `<img>` were requested at
          default priority and competed with the scripts below them.
        */}
        <Image
          src="/images/adem-mascot.webp"
          alt="Mascotte illustrée d’Adem tenant une tablette"
          width={1024}
          height={1536}
          sizes="(max-width: 760px) 70vw, 300px"
          priority
          fetchPriority="high"
        />
      </div>

      <aside className="home-hero-aside" aria-label="Profil, compétences et assistant">
        <div className="home-mini-grid">
          <article className="home-profile-card">
            <h2>{t('profile.heading')}</h2>
            <span className="home-profile-avatar" aria-hidden="true">
              {name.slice(0, 1).toUpperCase()}
              <i />
            </span>
            <strong>{name}</strong>
            <small>{role}</small>
            {location ? <small>{location}</small> : null}
            <Link href="/parcours">
              {t('profile.action')} <ArrowRight size={14} />
            </Link>
          </article>

          <article className="home-skills-card">
            <h2>{t('skills.heading')}</h2>
            <ul>
              {shownSkills.map((skill) => (
                <li key={skill}>
                  <TechnologyIcon name={skill} size={15} /> {skill}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <HeroChat retentionNotice={retentionNotice} />
      </aside>

      <Stagger className="home-stats" stagger={0.07} delay={0.35} onMount>
        <StaggerItem>
          <Rocket size={25} aria-hidden="true" />
          <span>
            <strong>+{projectCount}</strong>
            <small>{t('stats.projects', { count: projectCount })}</small>
          </span>
        </StaggerItem>
        <StaggerItem>
          <GitBranchPlus size={25} aria-hidden="true" />
          <span>
            <strong>{yearsOfExperience ?? 2}+</strong>
            <small>{t('stats.experience', { count: yearsOfExperience ?? 2 })}</small>
          </span>
        </StaggerItem>
        <StaggerItem>
          <Star size={25} aria-hidden="true" />
          <span>
            <strong>100%</strong>
            <small>{t('stats.satisfaction')}</small>
          </span>
        </StaggerItem>
      </Stagger>
    </section>
  )
}
