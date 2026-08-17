import { Mail, MapPin } from 'lucide-react'

import { ContactForm } from '@/components/contact-form'
import { getIdentity } from '@/lib/site-content'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Me joindre pour une mission frontend ou une question technique.',
}

async function ContactPage() {
  const identity = await getIdentity()

  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">Contact</p>
        <h1>Parlons de ce que tu veux construire.</h1>
        <p>
          Une mission frontend, un produit à restructurer ou simplement une question technique :
          écris-moi.
        </p>
      </header>
      <div className="contact-layout">
        <aside>
          <div className="contact-detail">
            <Mail size={18} />
            <div>
              <span>Email</span>
              <a href={`mailto:${identity.email}`}>{identity.email}</a>
            </div>
          </div>
          {identity.location ? (
            <div className="contact-detail">
              <MapPin size={18} />
              <div>
                <span>Localisation</span>
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
