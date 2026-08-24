import { createLumailProvider } from './lumail'

import type { LumailCredentials } from './lumail'
import type { EmailProvider } from './provider'

/**
 * Resolves the transactional sender from the environment.
 *
 * The vendor is not selectable at runtime, unlike the AI provider: there is one
 * sender, and swapping it means swapping the adapter here. What the environment
 * carries is the credentials and the addresses, which never belong in Payload.
 */

/**
 * The sender itself, plus the identity it posts under.
 *
 * The address travels with the provider because a caller that composes its own
 * message still has to announce who it comes from — Payload's email adapter
 * declares a default `from` up front, before any message exists.
 */
interface EmailSender {
  provider: EmailProvider
  fromEmail: string
  fromName?: string
}

/**
 * Reads what it takes to send anything at all.
 *
 * A recipient is deliberately not part of it: it belongs to whoever composes the
 * message, and only the contact form has a fixed one.
 */
const resolveCredentials = (env: NodeJS.ProcessEnv): LumailCredentials | null => {
  const apiToken = env.LUMAIL_API_TOKEN?.trim()
  const fromEmail = env.LUMAIL_FROM_EMAIL?.trim()

  if (!apiToken || !fromEmail) return null

  // Cosmetic, so its absence is not a reason to refuse. A blank value is treated
  // as unset rather than sent as an empty display name.
  const trimmedName = env.LUMAIL_FROM_NAME?.trim()
  const fromName = trimmedName === '' ? undefined : trimmedName

  return { apiToken, fromEmail, fromName }
}

/**
 * Builds the sender, or `null` when the environment does not configure one.
 *
 * `null` rather than a throw, mirroring `lib/ai`: a portfolio deployed before
 * its sending domain exists is a deployment state, not a bug. Each caller
 * answers it in its own terms — the contact form with a mailto fallback,
 * Payload by leaving password recovery unwired.
 */
const resolveEmailSender = (env: NodeJS.ProcessEnv = process.env): EmailSender | null => {
  const credentials = resolveCredentials(env)

  if (!credentials) return null

  return {
    provider: createLumailProvider(credentials),
    fromEmail: credentials.fromEmail,
    fromName: credentials.fromName,
  }
}

/**
 * Builds the provider the contact form uses, or `null` when it cannot send.
 *
 * Stricter than `resolveEmailSender`: this one carries the destination inbox, so
 * `CONTACT_TO_EMAIL` is required alongside the credentials. A token without a
 * verified `from` is rejected by Lumail, and a `from` without a recipient has
 * nowhere to land.
 */
const resolveEmailProvider = (env: NodeJS.ProcessEnv = process.env): EmailProvider | null => {
  const credentials = resolveCredentials(env)
  const toEmail = env.CONTACT_TO_EMAIL?.trim()

  if (!credentials || !toEmail) return null

  return createLumailProvider({ ...credentials, toEmail })
}

export { resolveEmailProvider, resolveEmailSender }
export type { EmailSender }
export { EmailError } from './provider'
