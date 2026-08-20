import type { EmailMessage } from './provider'

/**
 * Turns a form submission into the notification the site owner receives.
 *
 * Kept apart from the provider so the wording can change without touching the
 * transport, and so the shape of the mail is readable in one place.
 */

interface ContactSubmission {
  name: string
  email: string
  subject: string
  message: string
}

/**
 * Neutralises Markdown control characters at the start of a line.
 *
 * Lumail renders the body as Markdown, so a visitor writing `# free money` would
 * otherwise land as a heading. This is presentation hygiene, not security: the
 * recipient is the owner's own mailbox, and the value is never re-emitted as
 * HTML by us.
 */
const escapeMarkdown = (value: string): string => value.replace(/^([#>\-*+=]|\d+\.)/gm, '\\$1')

/**
 * Subject line, prefixed so these land in one thread-able bucket.
 *
 * The visitor's own subject follows, because scanning an inbox by sender alone
 * tells the owner nothing about what is being asked.
 */
const buildSubject = (subject: string): string => `[Portfolio] ${subject}`

const buildContactMessage = ({
  name,
  email,
  subject,
  message,
}: ContactSubmission): EmailMessage => ({
  subject: buildSubject(subject),
  text: [
    `**De :** ${escapeMarkdown(name)} (${email})`,
    `**Sujet :** ${escapeMarkdown(subject)}`,
    '',
    '---',
    '',
    escapeMarkdown(message),
  ].join('\n'),
  /**
   * The visitor's address, so hitting reply answers them rather than the
   * verified sending domain — which is a no-reply mailbox nobody reads.
   */
  replyTo: email,
})

export { buildContactMessage }
export type { ContactSubmission }
