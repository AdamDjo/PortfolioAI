import { EmailError } from './provider'

import { resolveEmailSender } from './index'

import type { EmailSender } from './index'
import type { EmailAdapter, SendEmailOptions } from 'payload'

/**
 * Bridges Payload's email interface onto the portfolio's own sender.
 *
 * Payload sends exactly one kind of message today — the password reset link —
 * and it has no transport of its own: without an adapter, `forgot-password`
 * reports success and delivers nothing. Rather than adding a second vendor for
 * that one message, this maps Payload's call onto the Lumail sender the contact
 * form already uses.
 *
 * Payload hands the body over as `html` because that is what its API is named,
 * but the transport posts markdown. The template in `users.ts` therefore writes
 * markdown into that field, which is why nothing here parses or escapes HTML:
 * the body is passed through as the text it already is.
 */

/**
 * Reduces Payload's recipient to the single address the transport accepts.
 *
 * Nodemailer's type allows an array and an object form, neither of which Payload
 * itself produces for a password reset. They are rejected rather than guessed at:
 * silently mailing the first entry of a list would send a reset link to the wrong
 * account.
 */
const readRecipient = (to: SendEmailOptions['to']): string => {
  if (typeof to === 'string' && to.trim()) return to.trim()

  throw new EmailError('bad_request', `Destinataire inattendu : ${JSON.stringify(to)}`)
}

/** Payload types the subject as optional; a mail without one is still a mistake. */
const readSubject = (subject: SendEmailOptions['subject']): string => {
  if (typeof subject === 'string' && subject.trim()) return subject.trim()

  throw new EmailError('bad_request', 'Sujet manquant')
}

/**
 * Reads the body out of whichever field carried it.
 *
 * `text` first because it needs no interpretation. `html` is the field Payload
 * fills, and the templates that feed it write markdown — see the module note.
 */
const readBody = ({ text, html }: SendEmailOptions): string => {
  if (typeof text === 'string' && text.trim()) return text
  if (typeof html === 'string' && html.trim()) return html

  throw new EmailError('bad_request', 'Corps de message vide')
}

/** Wraps a resolved sender into the adapter shape Payload initializes. */
const createPayloadEmailAdapter =
  ({ provider, fromEmail, fromName }: EmailSender): EmailAdapter<void> =>
  () => ({
    name: provider.id,
    defaultFromAddress: fromEmail,
    defaultFromName: fromName ?? fromEmail,
    sendEmail: async (message) => {
      await provider.send({
        to: readRecipient(message.to),
        subject: readSubject(message.subject),
        text: readBody(message),
      })
    },
  })

/**
 * The adapter for the current environment, or `undefined` when none is possible.
 *
 * `undefined` is what `buildConfig` expects for "no transport": Payload then logs
 * that email is not configured instead of failing to boot. That is the right
 * outcome for a deployment whose sending domain is not verified yet — the admin
 * still works, only recovery by email is unavailable.
 */
const resolvePayloadEmailAdapter = (
  env: NodeJS.ProcessEnv = process.env
): EmailAdapter<void> | undefined => {
  const sender = resolveEmailSender(env)

  return sender ? createPayloadEmailAdapter(sender) : undefined
}

export { createPayloadEmailAdapter, resolvePayloadEmailAdapter }
