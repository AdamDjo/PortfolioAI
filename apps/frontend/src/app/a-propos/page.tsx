import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Le parcours et l’approche frontend d’Adem.',
}

function AboutPage() {
  return (
    <div className="page shell about-page">
      <header className="page-heading">
        <p className="eyebrow">À propos</p>
        <h1>Je construis l’interface entre une idée et son usage.</h1>
        <p>
          Frontend engineer basé en France, je conçois des expériences web où la qualité visuelle,
          la performance et l’accessibilité avancent ensemble.
        </p>
      </header>
      <section className="content-section content-grid">
        <article>
          <p className="eyebrow">Approche</p>
          <h2>Moins de décor, plus d’intention.</h2>
          <p>
            Je pars du parcours utilisateur, puis je construis un système de composants cohérent.
            Chaque animation explique une transition, chaque contraste sert la lecture.
          </p>
        </article>
        <article>
          <p className="eyebrow">Stack</p>
          <h2>React, Next.js et TypeScript strict.</h2>
          <p>
            J’utilise le rendu serveur par défaut et je réserve le JavaScript client aux
            interactions qui en ont besoin. Le résultat reste rapide et maintenable.
          </p>
        </article>
      </section>
      <section className="content-section">
        <p className="eyebrow">Principes</p>
        <div className="principles-grid">
          <div>
            <strong>01</strong>
            <span>Comprendre avant de composer.</span>
          </div>
          <div>
            <strong>02</strong>
            <span>Rendre les états explicites.</span>
          </div>
          <div>
            <strong>03</strong>
            <span>Mesurer avant d’optimiser.</span>
          </div>
          <div>
            <strong>04</strong>
            <span>Livrer une base durable.</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export { AboutPage as default }
