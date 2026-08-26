import { CalendarClock } from 'lucide-react'
import Image from 'next/image'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'
import { buildPageMetadata } from '@/lib/i18n/metadata'
import { resolveLocale } from '@/lib/i18n/server'
import { getIdentity, getProfile, listExperiences } from '@/lib/site-content'

import { AnimatedCounter } from './_components/animated-counter'
import { CareerTimeline } from './_components/career-timeline'
import { SkillGroups } from './_components/skill-groups'
import { getAboutContent } from './_content'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/a-propos'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const { metadata } = getAboutContent(locale)
  return buildPageMetadata({ locale, path: '/a-propos', ...metadata })
}

async function AboutPage({ params }: PageProps<'/[lang]/a-propos'>) {
  const locale = await resolveLocale(params)
  // Three independent reads: they go out in parallel rather than in series.
  const [identity, profile, experiences] = await Promise.all([
    getIdentity(),
    getProfile(),
    listExperiences(),
  ])
  const { hero, stats, skills, career, principles } = getAboutContent(locale)

  return (
    <div className="page shell about-page">
      <div className="about-hero">
        <div>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>{profile.headline}</h1>
          <p>{profile.bio}</p>
          <p className="about-meta">
            {identity.role}
            {identity.location ? ` · ${identity.location}` : ''}
          </p>
        </div>
        <div className="about-portrait">
          <Image
            src="/images/adem-mascot.webp"
            width={1024}
            height={1536}
            sizes="(max-width: 640px) 82vw, 38vw"
            alt={hero.portraitAlt}
            priority
          />
        </div>
      </div>

      {profile.yearsOfExperience !== null ? (
        <Stagger className="about-stats" stagger={0.08} onMount>
          <StaggerItem variant="scale">
            <div className="about-stat">
              <span className="about-stat-icon" aria-hidden="true">
                <CalendarClock size={18} strokeWidth={1.8} />
              </span>
              <strong>
                <AnimatedCounter value={String(profile.yearsOfExperience)} delay={0.2} />
              </strong>
              <span className="about-stat-label">{stats.yearsLabel}</span>
            </div>
          </StaggerItem>
        </Stagger>
      ) : null}

      {profile.skillGroups.length > 0 ? (
        <section className="content-section">
          {/* This section still sits in the first screen: it animates on mount,
              otherwise it reserves its height without ever showing. */}
          <Reveal onMount>
            <p className="eyebrow">{skills.eyebrow}</p>
            <h2>{skills.heading}</h2>
          </Reveal>
          <SkillGroups groups={profile.skillGroups} onMount />
        </section>
      ) : null}

      {experiences.length > 0 ? (
        <section className="content-section">
          <Reveal>
            <p className="eyebrow">{career.eyebrow}</p>
            <h2>{career.heading}</h2>
          </Reveal>
          <CareerTimeline experiences={experiences} />
        </section>
      ) : null}

      {profile.principles.length > 0 ? (
        <section className="content-section">
          <Reveal>
            <p className="eyebrow">{principles.eyebrow}</p>
            <h2>{principles.heading}</h2>
          </Reveal>
          <Stagger className="principles-grid" stagger={0.08}>
            {profile.principles.map((principle, index) => (
              <StaggerItem key={principle.statement} variant="scale">
                <strong>0{index + 1}</strong>
                <span>{principle.statement}</span>
                {principle.detail ? <small>{principle.detail}</small> : null}
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : null}
    </div>
  )
}

export { AboutPage as default }
