import { Mail, MapPin } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { buildAlternates } from '@/i18n/metadata'
import { getPageLocale } from '@/i18n/params'
import { getIdentity } from '@/lib/site-content'

import { ContactForm } from './_components/contact-form'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const locale = await getPageLocale(params)
  const t = await getTranslations({ locale, namespace: 'Contact' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: buildAlternates(locale, '/contact'),
  }
}

async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const locale = await getPageLocale(params)
  setRequestLocale(locale)

  const [t, identity] = await Promise.all([getTranslations('Contact'), getIdentity()])

  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1>{t('title')}</h1>
        <p>{t('lead')}</p>
      </header>
      <div className="contact-layout">
        <aside>
          <div className="contact-detail">
            <Mail size={18} />
            <div>
              <span>{t('emailLabel')}</span>
              <a href={`mailto:${identity.email}`}>{identity.email}</a>
            </div>
          </div>
          {identity.location ? (
            <div className="contact-detail">
              <MapPin size={18} />
              <div>
                <span>{t('locationLabel')}</span>
                <p>{identity.location}</p>
              </div>
            </div>
          ) : null}
        </aside>
        <ContactForm email={identity.email} />
      </div>
    </div>
  )
}

export { ContactPage as default }
