import { Mail, MapPin } from 'lucide-react'

import { buildPageMetadata } from '@/lib/i18n/metadata'
import { resolveLocale } from '@/lib/i18n/server'
import { getIdentity } from '@/lib/site-content'

import { ContactForm } from './_components/contact-form'
import { getContactContent } from './_content'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/contact'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const { metadata } = getContactContent(locale)
  return buildPageMetadata({ locale, path: '/contact', ...metadata })
}

async function ContactPage({ params }: PageProps<'/[lang]/contact'>) {
  const locale = await resolveLocale(params)
  const identity = await getIdentity()
  const { heading, details } = getContactContent(locale)

  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">{heading.eyebrow}</p>
        <h1>{heading.title}</h1>
        <p>{heading.lead}</p>
      </header>
      <div className="contact-layout">
        <aside>
          <div className="contact-detail">
            <Mail size={18} />
            <div>
              <span>{details.emailLabel}</span>
              <a href={`mailto:${identity.email}`}>{identity.email}</a>
            </div>
          </div>
          {identity.location ? (
            <div className="contact-detail">
              <MapPin size={18} />
              <div>
                <span>{details.locationLabel}</span>
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
