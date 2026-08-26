'use client'

import { Send } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useActionState } from 'react'

import { useLocale } from '@/components/i18n/locale-context'
import { EASE_OUT_QUINT } from '@/components/motion/primitives'

import { submitContactForm } from '../_actions'
import { getContactContent } from '../_content'

import type { ContactState } from '../_actions'

/**
 * Contact form.
 *
 * Submission goes through a server action, so the message is sent even before
 * this component hydrates. When no sender is configured the action says so and
 * the form falls back to the mailto — the page never claims a message went out
 * when none did.
 */

const INITIAL_STATE: ContactState = { status: 'idle' }

/** Shared entrance for the feedback line, whatever it ends up saying. */
const FEEDBACK_MOTION = {
  initial: { opacity: 0, y: 12, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.45, ease: EASE_OUT_QUINT },
} as const

export function ContactForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(submitContactForm, INITIAL_STATE)
  const { form } = getContactContent(useLocale())

  return (
    <form className="contact-form" action={action}>
      <div className="field-row">
        <label htmlFor="contact-name">
          {form.nameLabel}
          <input id="contact-name" name="name" required autoComplete="name" maxLength={100} />
        </label>
        <label htmlFor="contact-email">
          {form.emailLabel}
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={100}
          />
        </label>
      </div>
      <label htmlFor="contact-subject">
        {form.subjectLabel}
        <input id="contact-subject" name="subject" required maxLength={150} />
      </label>
      <label htmlFor="contact-message">
        {form.messageLabel}
        <textarea id="contact-message" name="message" required rows={6} maxLength={5000} />
      </label>
      {/*
        Honeypot: hidden from people and from assistive tech, left in the DOM for
        bots that fill every field they find. `tabIndex={-1}` keeps it out of
        keyboard navigation so nobody lands in it by accident.
      */}
      <input
        className="honeypot"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <m.button
        className="button button-primary"
        type="submit"
        disabled={pending}
        whileHover={pending ? undefined : { scale: 1.02 }}
        whileTap={pending ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      >
        {pending ? form.pendingLabel : form.submitLabel} <Send size={15} />
      </m.button>
      <AnimatePresence mode="wait">
        {state.status === 'sent' ? (
          <m.p key="sent" className="form-success" role="status" {...FEEDBACK_MOTION}>
            {form.successMessage}
          </m.p>
        ) : null}
        {state.status === 'unconfigured' ? (
          <m.p key="unconfigured" className="form-success" role="status" {...FEEDBACK_MOTION}>
            {form.unconfiguredMessage} <a href={`mailto:${email}`}>{email}</a>.
          </m.p>
        ) : null}
        {state.status === 'error' ? (
          <m.p key="error" className="form-error" role="alert" {...FEEDBACK_MOTION}>
            {state.message}
          </m.p>
        ) : null}
      </AnimatePresence>
    </form>
  )
}
