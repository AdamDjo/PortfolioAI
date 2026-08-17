import { CalendarClock } from 'lucide-react'
import Image from 'next/image'

import { CareerTimeline } from '@/components/career-timeline'
import { AnimatedCounter } from '@/components/motion/animated-counter'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'
import { SkillGroups } from '@/components/motion/skill-groups'
import { getIdentity, getProfile, listExperiences } from '@/lib/site-content'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Le parcours, les compétences et l’approche frontend d’Adem.',
}

async function AboutPage() {
  // Trois lectures indépendantes : elles partent en parallèle plutôt qu'en série.
  const [identity, profile, experiences] = await Promise.all([
    getIdentity(),
    getProfile(),
    listExperiences(),
  ])

  return (
    <div className="page shell about-page">
      <div className="about-hero">
        <div>
          <p className="eyebrow">À propos</p>
          <h1>{profile.headline}</h1>
          <p>{profile.bio}</p>
          <p className="about-meta">
            {identity.role}
            {identity.location ? ` · ${identity.location}` : ''}
          </p>
        </div>
        <div className="about-portrait">
          <Image
            className="brain-light"
            src="/images/hero-brain-light.webp"
            width={1080}
            height={720}
            alt="Illustration d’un cerveau relié par un réseau neuronal"
          />
          <Image
            className="brain-dark"
            src="/images/hero-brain-dark.webp"
            width={1080}
            height={720}
            alt=""
            aria-hidden="true"
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
              <span className="about-stat-label">Années d’expérience</span>
            </div>
          </StaggerItem>
        </Stagger>
      ) : null}

      {profile.skillGroups.length > 0 ? (
        <section className="content-section">
          {/* Cette section est encore dans le premier écran : elle s'anime au montage,
              sinon elle réserve sa hauteur sans jamais s'afficher. */}
          <Reveal onMount>
            <p className="eyebrow">Compétences</p>
            <h2>Ce que j’utilise au quotidien.</h2>
          </Reveal>
          <SkillGroups groups={profile.skillGroups} onMount />
        </section>
      ) : null}

      {experiences.length > 0 ? (
        <section className="content-section">
          <Reveal>
            <p className="eyebrow">Parcours</p>
            <h2>Où j’ai travaillé, et sur quoi.</h2>
          </Reveal>
          <CareerTimeline experiences={experiences} />
        </section>
      ) : null}

      {profile.principles.length > 0 ? (
        <section className="content-section">
          <Reveal>
            <p className="eyebrow">Principes</p>
            <h2>Comment je travaille.</h2>
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
