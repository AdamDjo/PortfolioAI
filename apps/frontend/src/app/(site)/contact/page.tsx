'use client'

import { Mail, MapPin, Send } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useState, type FormEvent } from 'react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

function ContactPage() {
  const [sent, setSent] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSent(true)
  }

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
              <a href="mailto:hello@adem.dev">hello@adem.dev</a>
            </div>
          </div>
          <div className="contact-detail">
            <MapPin size={18} />
            <div>
              <span>Localisation</span>
              <p>France · Remote</p>
            </div>
          </div>
        </aside>
        <form className="contact-form" onSubmit={submit}>
          <div className="field-row">
            <label htmlFor="contact-name">
              Nom
              <input id="contact-name" name="name" required autoComplete="name" />
            </label>
            <label htmlFor="contact-email">
              Email
              <input id="contact-email" name="email" type="email" required autoComplete="email" />
            </label>
          </div>
          <label htmlFor="contact-subject">
            Sujet
            <input id="contact-subject" name="subject" required />
          </label>
          <label htmlFor="contact-message">
            Message
            <textarea id="contact-message" name="message" required rows={6} />
          </label>
          <m.button
            className="button button-primary"
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          >
            Envoyer le message <Send size={15} />
          </m.button>
          <AnimatePresence>
            {sent ? (
              <m.p
                className="form-success"
                role="status"
                initial={{ opacity: 0, y: 12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT_QUINT }}
              >
                Message prêt à être envoyé. La connexion au service email sera ajoutée
                prochainement.
              </m.p>
            ) : null}
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}

export { ContactPage as default }
