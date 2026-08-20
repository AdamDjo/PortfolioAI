import { EmailError } from './provider'

import type { EmailMessage, EmailProvider } from './provider'

/**
 * Lumail transactional sender.
 *
 * Lumail is API-first: its own docs present the SMTP relay as the fallback for
 * tools that speak nothing else. Both land in the same priority lane, so the API
 * is the direct route and needs no extra dependency.
 *
 * The send is asynchronous — a 200 means Lumail queued the message, not that a
 * mailbox received it. Nothing here should read as delivery confirmation.
 */

const ENDPOINT = 'https://lumail.io/api/v1/emails'

interface LumailConfig {
  apiToken: string
  fromEmail: string
  /** Display name shown as the sender. Optional: the address alone is valid. */
  fromName?: string
  /** Where contact notifications land. Unlike `fromEmail`, any domain works. */
  toEmail: string
}

/**
 * Builds the `from` value.
 *
 * RFC 5322 display-name form, so an inbox shows a name rather than a raw
 * address. The name is quoted because a comma or a period in it would otherwise
 * split the address, and unquoting is the vendor's job, not ours.
 */
const formatSender = (email: string, name?: string): string =>
  name ? `"${name.replace(/"/g, '')}" <${email}>` : email

/**
 * Maps an HTTP status onto the kinds callers act on.
 *
 * 404 is folded into `bad_request`: Lumail returns it when the recipient cannot
 * be resolved, which from here is a malformed address, not a server fault.
 */
const classify = (status: number, message: string): EmailError => {
  if (status === 401 || status === 403) return new EmailError('unauthorized', message)
  if (status === 429) return new EmailError('rate_limited', message)
  if (status === 400 || status === 404) return new EmailError('bad_request', message)
  return new EmailError('provider_error', message)
}

/** Pulls Lumail's error text out of a failed response without assuming its shape. */
const readError = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json()
    const message = (body as { message?: unknown })?.message
    return typeof message === 'string' ? message : `Lumail HTTP ${response.status}`
  } catch {
    return `Lumail HTTP ${response.status}`
  }
}

const createLumailProvider = ({
  apiToken,
  fromEmail,
  fromName,
  toEmail,
}: LumailConfig): EmailProvider => ({
  id: 'lumail',
  send: async ({ subject, text, replyTo }: EmailMessage) => {
    let response: Response
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: toEmail,
          from: formatSender(fromEmail, fromName),
          subject,
          content: text,
          contentType: 'MARKDOWN',
          replyTo,
          /**
           * Both trackers off. Link tracking rewrites every URL through a
           * redirect, which mangles anything a visitor pasted into their
           * message; open tracking embeds a pixel. Neither belongs in a
           * notification addressed to the site owner.
           */
          tracking: { links: false, open: false },
        }),
      })
    } catch (error) {
      // Network-level failure: Lumail was never reached.
      throw new EmailError('provider_error', error instanceof Error ? error.message : 'Réseau')
    }

    if (!response.ok) throw classify(response.status, await readError(response))
  },
})

export { createLumailProvider }
