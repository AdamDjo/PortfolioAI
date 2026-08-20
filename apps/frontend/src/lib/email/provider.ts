/**
 * Vendor-agnostic contract for sending one transactional email.
 *
 * The portfolio sends a handful of messages triggered one at a time — a contact
 * form entry today, an account recovery mail tomorrow. Nothing here models
 * campaigns, lists or templates: that is the vendor's own domain, and pulling it
 * into this interface would tie the callers to whoever is behind it.
 */

/** What a caller hands over. `replyTo` is what makes an answer one click away. */
interface EmailMessage {
  subject: string
  /** Plain text. Callers build it; no provider-specific templating is involved. */
  text: string
  /** Reply target, so answering the notification reaches the visitor directly. */
  replyTo?: string
}

type EmailErrorKind =
  /** The message itself is invalid — a rejected address, an empty body. */
  | 'bad_request'
  /** The token is missing, expired or lacks the scope to send. */
  | 'unauthorized'
  /** The vendor throttled us. */
  | 'rate_limited'
  /** The vendor failed or could not be reached. */
  | 'provider_error'

/**
 * Failure that already carries its cause.
 *
 * The kind lets the caller decide what the visitor sees without parsing vendor
 * payloads: a bad address is the visitor's problem to fix, everything else is
 * ours to log and apologise for.
 */
class EmailError extends Error {
  readonly kind: EmailErrorKind

  constructor(kind: EmailErrorKind, message: string) {
    super(message)
    this.name = 'EmailError'
    this.kind = kind
  }
}

interface EmailProvider {
  /** Vendor identifier, used in logs so a failure names who refused it. */
  readonly id: string
  send: (message: EmailMessage) => Promise<void>
}

export { EmailError }
export type { EmailErrorKind, EmailMessage, EmailProvider }
