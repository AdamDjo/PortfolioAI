import { getIdentity } from '@/lib/site-content'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Éditeur, hébergeur et traitement des données de ce site.',
}

async function LegalPage() {
  const identity = await getIdentity()
  const { legal } = identity

  return (
    <div className="page shell legal-page">
      <header className="page-heading">
        <p className="eyebrow">Informations</p>
        <h1>Mentions légales</h1>
      </header>
      <section className="content-section">
        <h2>Éditeur</h2>
        <p>
          Ce site est édité à titre personnel par {legal.publisher ?? identity.fullName},{' '}
          {identity.role}
          {identity.location ? `, ${identity.location}` : ''}.
        </p>
        <p>
          Contact : <a href={`mailto:${identity.email}`}>{identity.email}</a>
        </p>

        <h2>Hébergement</h2>
        {legal.hostName ? (
          <p>
            {legal.hostName}
            {legal.hostAddress ? (
              <>
                {' — '}
                {legal.hostAddress}
              </>
            ) : null}
          </p>
        ) : (
          // Champ non renseigné : on le dit plutôt que d'inscrire un hébergeur
          // approximatif dans une mention qui engage juridiquement l'éditeur.
          <p>L’hébergeur sera précisé ici avant la mise en ligne publique du site.</p>
        )}

        <h2>Données personnelles</h2>
        {legal.dataPolicy ? (
          <p>{legal.dataPolicy}</p>
        ) : (
          <p>
            Ce site ne dépose aucun cookie de mesure d’audience et ne collecte aucune donnée de
            navigation. Le seul choix conservé est la préférence de thème clair ou sombre, stockée
            localement dans le navigateur et jamais transmise.
          </p>
        )}

        <h2>Propriété intellectuelle</h2>
        <p>
          Les textes et visuels de ce site sont la propriété de {identity.fullName}, sauf mention
          contraire. Le code source des projets présentés est publié sous licence libre sur les
          dépôts indiqués.
        </p>
      </section>
    </div>
  )
}

export { LegalPage as default }
