'use client'

import { Mail, MapPin, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'

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
            <label>
              Nom
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              Email
              <input name="email" type="email" required autoComplete="email" />
            </label>
          </div>
          <label>
            Sujet
            <input name="subject" required />
          </label>
          <label>
            Message
            <textarea name="message" required rows={6} />
          </label>
          <button className="button button-primary" type="submit">
            Envoyer le message <Send size={15} />
          </button>
          {sent ? (
            <p className="form-success" role="status">
              Message prêt à être envoyé. La connexion au service email sera ajoutée avec le
              backend.
            </p>
          ) : null}
        </form>
      </div>
    </div>
  )
}

export { ContactPage as default }
