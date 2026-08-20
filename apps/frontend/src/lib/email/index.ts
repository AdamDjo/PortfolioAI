import { createLumailProvider } from './lumail'

import type { EmailProvider } from './provider'

/**
 * Resolves the transactional sender from the environment.
 *
 * The vendor is not selectable at runtime, unlike the AI provider: there is one
 * sender, and swapping it means swapping the adapter here. What the environment
 * carries is the credentials and the addresses, which never belong in Payload.
 */

/**
 * Builds the provider, or `null` when the environment does not configure one.
 *
 * `null` rather than a throw, mirroring `lib/ai`: a portfolio deployed before its
 * sending domain exists is a deployment state, not a bug. The caller answers it
 * with the mailto fallback, so the page keeps working while the DNS records are
 * still propagating.
 *
 * All three values are required together — a token without a verified `from` is
 * rejected by Lumail, and a `from` without a recipient has nowhere to land.
 */
const resolveEmailProvider = (env: NodeJS.ProcessEnv = process.env): EmailProvider | null => {
  const apiToken = env.LUMAIL_API_TOKEN?.trim()
  const fromEmail = env.LUMAIL_FROM_EMAIL?.trim()
  const toEmail = env.CONTACT_TO_EMAIL?.trim()

  if (!apiToken || !fromEmail || !toEmail) return null

  // Cosmetic, so its absence is not a reason to refuse. A blank value is treated
  // as unset rather than sent as an empty display name.
  const trimmedName = env.LUMAIL_FROM_NAME?.trim()
  const fromName = trimmedName === '' ? undefined : trimmedName

  return createLumailProvider({ apiToken, fromEmail, fromName, toEmail })
}

export { resolveEmailProvider }
export { EmailError } from './provider'
export type { EmailErrorKind, EmailMessage, EmailProvider } from './provider'
