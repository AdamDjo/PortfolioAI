import { getIdentity } from '@/lib/site-content'

import { LEGAL_CONTENT } from './_content'

import type { Metadata } from 'next'

export const metadata: Metadata = LEGAL_CONTENT.metadata

async function LegalPage() {
  const identity = await getIdentity()
  const { legal } = identity
  const { heading, sections } = LEGAL_CONTENT

  return (
    <div className="page shell legal-page">
      <header className="page-heading">
        <p className="eyebrow">{heading.eyebrow}</p>
        <h1>{heading.title}</h1>
      </header>
      <section className="content-section">
        <h2>{sections.publisher.title}</h2>
        {/*
          Only page to name the publisher in full: the law requires a complete
          identity here, while the rest of the site sticks to the display name.
          No fallback to the latter — a first name alone does not satisfy the
          obligation, better to announce the missing field.
        */}
        {legal.publisher ? (
          <p>
            Ce site est édité à titre personnel par {legal.publisher}, {identity.role}
            {identity.location ? `, ${identity.location}` : ''}.
          </p>
        ) : (
          <p>{sections.publisher.fallback}</p>
        )}
        <p>
          {sections.publisher.contactLabel} :{' '}
          <a href={`mailto:${identity.email}`}>{identity.email}</a>
        </p>

        <h2>{sections.hosting.title}</h2>
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
          // Field not filled in: say so rather than write an approximate host
          // into a notice that legally binds the publisher.
          <p>{sections.hosting.fallback}</p>
        )}

        <h2>{sections.dataPolicy.title}</h2>
        <p>{legal.dataPolicy ?? sections.dataPolicy.fallback}</p>

        <h2>{sections.intellectualProperty.title}</h2>
        <p>
          Les textes et visuels de ce site sont la propriété de{' '}
          {legal.publisher ?? identity.displayName}, sauf mention contraire. Le code source des
          projets présentés est publié sous licence libre sur les dépôts indiqués.
        </p>
      </section>
    </div>
  )
}

export { LegalPage as default }
