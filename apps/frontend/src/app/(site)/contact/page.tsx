import { Mail, MapPin } from 'lucide-react'

import { getIdentity } from '@/lib/site-content'

import { ContactForm } from './_components/contact-form'
import { CONTACT_CONTENT } from './_content'

import type { Metadata } from 'next'

export const metadata: Metadata = CONTACT_CONTENT.metadata

async function ContactPage() {
  const identity = await getIdentity()
  const { heading, details } = CONTACT_CONTENT

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
