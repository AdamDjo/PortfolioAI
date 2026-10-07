import { ArrowRight, CalendarClock } from 'lucide-react'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'
import { buildAlternates } from '@/i18n/metadata'
import { Link } from '@/i18n/navigation'
import { getPageLocale } from '@/i18n/params'
import { getIdentity, getProfile, getServicesSettings, listExperiences } from '@/lib/site-content'

import { AnimatedCounter } from './_components/animated-counter'
import { CareerTimeline } from './_components/career-timeline'
import { SkillGroups } from './_components/skill-groups'

import type { Metadata } from 'next'

/** The freelance offers, in display order. Their copy lives in the `Services` catalogue. */
const SERVICE_OFFERS = ['frontend', 'ai', 'audit'] as const

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/parcours'>): Promise<Metadata> {
  const locale = await getPageLocale(params)
  const t = await getTranslations({ locale, namespace: 'About' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: buildAlternates(locale, '/parcours'),
  }
}

async function AboutPage({ params }: PageProps<'/[locale]/parcours'>) {
  const locale = await getPageLocale(params)
  setRequestLocale(locale)

  // Independent reads: they go out in parallel rather than in series.
  const [t, tServices, identity, profile, experiences, servicesSettings] = await Promise.all([
    getTranslations('About'),
    getTranslations('Services'),
    getIdentity(locale),
    getProfile(locale),
    listExperiences(locale),
    getServicesSettings(locale),
  ])

  return (
    <div className="page shell about-page">
      <div className="about-hero">
        <div>
          <p className="eyebrow">{t('eyebrow')}</p>
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
            // Matches the rendered width: 260px of a 390px viewport on mobile.
            sizes="(max-width: 640px) 68vw, 38vw"
            alt={t('portraitAlt')}
            priority
            // `priority` only emits the preload in Next 16; the fetch priority of
            // the LCP image itself has to be raised explicitly.
            fetchPriority="high"
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
              <span className="about-stat-label">{t('yearsLabel')}</span>
            </div>
          </StaggerItem>
        </Stagger>
      ) : null}

      {experiences.length > 0 ? (
        <section className="content-section">
          <Reveal>
            <p className="eyebrow">{t('careerEyebrow')}</p>
            <h2>{t('careerHeading')}</h2>
          </Reveal>
          <CareerTimeline experiences={experiences} />
        </section>
      ) : null}

      {profile.principles.length > 0 ? (
        <section className="content-section">
          <Reveal>
            <p className="eyebrow">{t('principlesEyebrow')}</p>
            <h2>{t('principlesHeading')}</h2>
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

      {profile.skillGroups.length > 0 ? (
        <section className="content-section">
          <Reveal>
            <p className="eyebrow">{t('skillsEyebrow')}</p>
            <h2>{t('skillsHeading')}</h2>
          </Reveal>
          <SkillGroups groups={profile.skillGroups} />
        </section>
      ) : null}

      {/*
        The freelance offer can be pulled from `/admin` without a redeploy — see
        `cms/globals/services-settings.ts`. Turned off, the section is simply not
        rendered; `/services` still redirects here and lands at the top.
      */}
      {servicesSettings.enabled ? (
        <section className="content-section" id="services">
          <Reveal>
            <p className="eyebrow">{tServices('eyebrow')}</p>
            <h2>{tServices('title')}</h2>
            <p>{tServices('lead')}</p>
          </Reveal>
          <Stagger className="principles-grid services-grid" stagger={0.08}>
            {SERVICE_OFFERS.map((offer) => (
              <StaggerItem key={offer} variant="scale">
                <span>{tServices(`offers.${offer}.title`)}</span>
                <small>{tServices(`offers.${offer}.description`)}</small>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="services-cta">
            <Link className="button button-primary" href="/contact">
              {tServices('cta')} <ArrowRight size={16} />
            </Link>
          </Reveal>
        </section>
      ) : null}
    </div>
  )
}

export { AboutPage as default }
