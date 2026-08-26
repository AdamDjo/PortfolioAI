import { buildPageMetadata } from '@/lib/i18n/metadata'
import { resolveLocale } from '@/lib/i18n/server'

import { getPrivacyContent } from './_content'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/confidentialite'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const { metadata } = getPrivacyContent(locale)
  return buildPageMetadata({ locale, path: '/confidentialite', ...metadata })
}

async function PrivacyPage({ params }: PageProps<'/[lang]/confidentialite'>) {
  const locale = await resolveLocale(params)
  const { heading, sections } = getPrivacyContent(locale)

  return (
    <div className="page shell legal-page">
      <header className="page-heading">
        <p className="eyebrow">{heading.eyebrow}</p>
        <h1>{heading.title}</h1>
        <p>{heading.lead}</p>
      </header>
      {sections.map((section) => (
        <section className="content-section" key={section.title}>
          <h2>{section.title}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </div>
  )
}

export { PrivacyPage as default }
