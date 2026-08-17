'use client'

import { Send } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useState, type FormEvent } from 'react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

/**
 * Formulaire de contact.
 *
 * Aucun service d'envoi n'est encore branché : la soumission n'envoie rien et le
 * message affiché le dit, plutôt que de laisser croire à un message parti.
 */
export function ContactForm({ email }: { email: string }) {
  const [sent, setSent] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSent(true)
  }

  return (
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
            Le service d’envoi n’est pas encore branché. En attendant, écris-moi directement à{' '}
            <a href={`mailto:${email}`}>{email}</a>.
          </m.p>
        ) : null}
      </AnimatePresence>
    </form>
  )
}
