import { getTranslations, setRequestLocale } from 'next-intl/server'

import { buildAlternates } from '@/i18n/metadata'
import { getPageLocale } from '@/i18n/params'
import { getIdentity } from '@/lib/site-content'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/mentions-legales'>): Promise<Metadata> {
  const locale = await getPageLocale(params)
  const t = await getTranslations({ locale, namespace: 'Legal' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: buildAlternates(locale, '/mentions-legales'),
  }
}

async function LegalPage({ params }: PageProps<'/[locale]/mentions-legales'>) {
  const locale = await getPageLocale(params)
  setRequestLocale(locale)

  const [t, identity] = await Promise.all([getTranslations('Legal'), getIdentity()])
  const { legal } = identity
  const role = identity.location ? `${identity.role}, ${identity.location}` : identity.role

  return (
    <div className="page shell legal-page">
      <header className="page-heading">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1>{t('title')}</h1>
      </header>
      <section className="content-section">
        <h2>{t('publisherTitle')}</h2>
        {/*
          Only page to name the publisher in full: the law requires a complete
          identity here, while the rest of the site sticks to the display name.
          No fallback to the latter — a first name alone does not satisfy the
          obligation, better to announce the missing field.
        */}
        {legal.publisher ? (
          <p>{t('publisherStatement', { publisher: legal.publisher, role })}</p>
        ) : (
          <p>{t('publisherFallback')}</p>
        )}
        <p>
          {t('contactLabel')} <a href={`mailto:${identity.email}`}>{identity.email}</a>
        </p>

        <h2>{t('hostingTitle')}</h2>
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
          <p>{t('hostingFallback')}</p>
        )}

        <h2>{t('dataPolicyTitle')}</h2>
        <p>{legal.dataPolicy ?? t('dataPolicyFallback')}</p>

        <h2>{t('intellectualPropertyTitle')}</h2>
        <p>{t('intellectualPropertyBody', { owner: legal.publisher ?? identity.displayName })}</p>
      </section>
    </div>
  )
}

export { LegalPage as default }
