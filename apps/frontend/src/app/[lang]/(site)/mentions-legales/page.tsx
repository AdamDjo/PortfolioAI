import { buildPageMetadata } from '@/lib/i18n/metadata'
import { resolveLocale } from '@/lib/i18n/server'
import { getIdentity } from '@/lib/site-content'

import { getLegalContent } from './_content'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/mentions-legales'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const { metadata } = getLegalContent(locale)
  return buildPageMetadata({ locale, path: '/mentions-legales', ...metadata })
}

async function LegalPage({ params }: PageProps<'/[lang]/mentions-legales'>) {
  const locale = await resolveLocale(params)
  const identity = await getIdentity()
  const { legal } = identity
  const { heading, sections } = getLegalContent(locale)

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
            {sections.publisher.statement(legal.publisher, identity.role, identity.location ?? '')}
          </p>
        ) : (
          <p>{sections.publisher.fallback}</p>
        )}
        <p>
          {sections.publisher.contactLabel}{' '}
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
        <p>{sections.intellectualProperty.body(legal.publisher ?? identity.displayName)}</p>
      </section>
    </div>
  )
}

export { LegalPage as default }
