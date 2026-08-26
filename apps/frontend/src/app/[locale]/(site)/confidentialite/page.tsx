import { getTranslations, setRequestLocale } from 'next-intl/server'

import { buildAlternates } from '@/i18n/metadata'
import { getPageLocale } from '@/i18n/params'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/confidentialite'>): Promise<Metadata> {
  const locale = await getPageLocale(params)
  const t = await getTranslations({ locale, namespace: 'Privacy' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: buildAlternates(locale, '/confidentialite'),
  }
}

/**
 * Sections are listed here rather than iterated from the catalogue: each one is
 * a distinct key, so a missing translation is a type error instead of a section
 * that silently disappears.
 */
const SECTIONS = [
  { title: 'collectedTitle', body: ['collectedBody1', 'collectedBody2'] },
  { title: 'whyTitle', body: ['whyBody'] },
  { title: 'retentionTitle', body: ['retentionBody'] },
  { title: 'rightsTitle', body: ['rightsBody'] },
] as const

async function PrivacyPage({ params }: PageProps<'/[locale]/confidentialite'>) {
  const locale = await getPageLocale(params)
  setRequestLocale(locale)

  const t = await getTranslations('Privacy')

  return (
    <div className="page shell legal-page">
      <header className="page-heading">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1>{t('title')}</h1>
        <p>{t('lead')}</p>
      </header>
      {SECTIONS.map((section) => (
        <section className="content-section" key={section.title}>
          <h2>{t(section.title)}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{t(paragraph)}</p>
          ))}
        </section>
      ))}
    </div>
  )
}

export { PrivacyPage as default }
