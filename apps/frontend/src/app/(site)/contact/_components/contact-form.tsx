'use client'

import { Send } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useState, type FormEvent } from 'react'

import { EASE_OUT_QUINT } from '@/components/motion/primitives'

import { CONTACT_CONTENT } from '../_content'

/**
 * Contact form.
 *
 * No sending service is wired up yet: submitting sends nothing and the message
 * shown says so, rather than letting the visitor believe a message went out.
 */
export function ContactForm({ email }: { email: string }) {
  const [sent, setSent] = useState(false)
  const { form } = CONTACT_CONTENT

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="field-row">
        <label htmlFor="contact-name">
          {form.nameLabel}
          <input id="contact-name" name="name" required autoComplete="name" />
        </label>
        <label htmlFor="contact-email">
          {form.emailLabel}
          <input id="contact-email" name="email" type="email" required autoComplete="email" />
        </label>
      </div>
      <label htmlFor="contact-subject">
        {form.subjectLabel}
        <input id="contact-subject" name="subject" required />
      </label>
      <label htmlFor="contact-message">
        {form.messageLabel}
        <textarea id="contact-message" name="message" required rows={6} />
      </label>
      <m.button
        className="button button-primary"
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      >
        {form.submitLabel} <Send size={15} />
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
            {form.successMessage} <a href={`mailto:${email}`}>{email}</a>.
          </m.p>
        ) : null}
      </AnimatePresence>
    </form>
  )
}
