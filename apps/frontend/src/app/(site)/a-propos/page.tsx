import Image from 'next/image'

import { AnimatedCounter } from '@/components/motion/animated-counter'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'
import { SkillBars } from '@/components/motion/skill-bars'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Le parcours, les compétences et l’approche frontend d’Adem.',
}

const stats = [
  { value: '5', label: 'Années de pratique' },
  { value: '30', label: 'Projets livrés' },
  { value: '98', label: 'Score Lighthouse moyen' },
  { value: '100%', label: 'TypeScript strict' },
]

const skills = [
  { label: 'React & Next.js', level: 92, note: 'App Router, RSC' },
  { label: 'TypeScript', level: 88, note: 'Mode strict' },
  { label: 'CSS & Design System', level: 90, note: 'Tokens, thèmes' },
  { label: 'Motion & Interaction', level: 84, note: 'Motion, transitions' },
  { label: 'Accessibilité', level: 80, note: 'WCAG AA' },
  { label: 'Node & API', level: 72, note: 'Payload, PostgreSQL' },
]

const principles = [
  'Comprendre avant de composer.',
  'Rendre les états explicites.',
  'Mesurer avant d’optimiser.',
  'Livrer une base durable.',
]

function AboutPage() {
  return (
    <div className="page shell about-page">
      <div className="about-hero">
        <div>
          <p className="eyebrow">À propos</p>
          <h1>Je construis l’interface entre une idée et son usage.</h1>
          <p>
            Frontend engineer basé en France, je conçois des expériences web où la qualité visuelle,
            la performance et l’accessibilité avancent ensemble. J’aime les produits où chaque
            détail d’interaction a été décidé, pas subi.
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

      <Stagger className="about-stats" stagger={0.08}>
        {stats.map((stat, index) => (
          <StaggerItem key={stat.label} variant="scale">
            <div className="about-stat">
              <strong>
                <AnimatedCounter value={stat.value} delay={0.2 + index * 0.08} />
              </strong>
              <span>{stat.label}</span>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <section className="content-section">
        <Reveal>
          <p className="eyebrow">Compétences</p>
          <h2>Ce que je maîtrise au quotidien.</h2>
        </Reveal>
        <SkillBars skills={skills} />
      </section>

      <Stagger className="content-section content-grid" stagger={0.12}>
        <StaggerItem>
          <article>
            <p className="eyebrow">Approche</p>
            <h2>Moins de décor, plus d’intention.</h2>
            <p>
              Je pars du parcours utilisateur, puis je construis un système de composants cohérent.
              Chaque animation explique une transition, chaque contraste sert la lecture.
            </p>
          </article>
        </StaggerItem>
        <StaggerItem>
          <article>
            <p className="eyebrow">Stack</p>
            <h2>React, Next.js et TypeScript strict.</h2>
            <p>
              J’utilise le rendu serveur par défaut et je réserve le JavaScript client aux
              interactions qui en ont besoin. Le résultat reste rapide et maintenable.
            </p>
          </article>
        </StaggerItem>
      </Stagger>

      <section className="content-section">
        <Reveal>
          <p className="eyebrow">Principes</p>
        </Reveal>
        <Stagger className="principles-grid" stagger={0.08}>
          {principles.map((principle, index) => (
            <StaggerItem key={principle} variant="scale">
              <strong>0{index + 1}</strong>
              <span>{principle}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  )
}

export { AboutPage as default }
