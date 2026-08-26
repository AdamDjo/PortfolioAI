'use server'

import { headers } from 'next/headers'
import { z } from 'zod'

import { EmailError, resolveEmailProvider } from '@/lib/email'
import { buildContactMessage } from '@/lib/email/contact-message'
import { allowSubmission } from '@/lib/email/rate-limit'

/**
 * Server action behind the contact form.
 *
 * It answers with a discriminated state rather than throwing: every outcome here
 * is something the visitor should read in the form, including the case where no
 * sender is configured at all.
 */

/**
 * Bounds mirroring the column widths a human actually uses. They are validation,
 * not politeness: the body is forwarded to a vendor that bills and rate-limits.
 */
const MAX_NAME_LENGTH = 100
const MAX_SUBJECT_LENGTH = 150
const MAX_MESSAGE_LENGTH = 5_000

const submissionSchema = z.object({
  name: z.string().trim().min(1, 'Nom requis').max(MAX_NAME_LENGTH),
  /** Trimmed first: a pasted address often carries a trailing space. */
  email: z.string().trim().pipe(z.email('Adresse invalide').max(MAX_NAME_LENGTH)),
  subject: z.string().trim().min(1, 'Sujet requis').max(MAX_SUBJECT_LENGTH),
  message: z.string().trim().min(1, 'Message requis').max(MAX_MESSAGE_LENGTH),
  /**
   * Honeypot. Hidden from people, so anything in it came from a bot filling
   * every field it found.
   *
   * Deliberately not constrained to an empty string: rejecting it here would
   * answer a filled trap with a validation error, which tells whoever wrote the
   * bot exactly which field gave them away. It is parsed as free text and acted
   * on below, once the submission is otherwise valid.
   */
  website: z.string().optional(),
})

/**
 * What the form renders back.
 *
 * `unconfigured` is deliberately distinct from `error`: nothing failed, the site
 * simply has no sending domain yet, and the form offers the mailto instead of
 * apologising for a breakage that did not happen.
 */
type ContactState =
  | { status: 'idle' }
  | { status: 'sent' }
  | { status: 'unconfigured' }
  | { status: 'error'; message: string }

/**
 * Identifies the caller for throttling.
 *
 * `x-forwarded-for` is set by the platform proxy in front of the app. It is
 * spoofable when the app is reached directly, which is why the honeypot carries
 * the other half of the anti-spam and neither is trusted alone.
 */
const callerKey = async (): Promise<string> => {
  const list = await headers()
  const client = list.get('x-forwarded-for')?.split(',')[0]?.trim()

  // An empty header is as useless as a missing one, so both share the bucket:
  // unidentified callers throttle each other rather than bypassing the limit.
  return client === undefined || client === '' ? 'unknown' : client
}

/** Visitor-facing wording. Vendor detail stays in the logs, never on screen. */
const ERROR_MESSAGES = {
  invalid: 'Vérifie les champs du formulaire.',
  throttled: 'Tu viens déjà d’envoyer un message. Réessaie dans une minute.',
  failed: 'L’envoi a échoué. Réessaie ou écris-moi directement.',
} as const

async function submitContactForm(
  _previous: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = submissionSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    website: formData.get('website') ?? undefined,
  })

  if (!parsed.success) {
    return { status: 'error', message: ERROR_MESSAGES.invalid }
  }

  const { website, ...submission } = parsed.data

  /**
   * A filled honeypot reports success without sending anything. Telling a bot it
   * was detected only teaches whoever wrote it to fix the next attempt.
   *
   * Trimmed first, so a browser autofilling a space does not silently discard a
   * real visitor's message.
   */
  if (website !== undefined && website.trim() !== '') return { status: 'sent' }

  if (!allowSubmission(await callerKey())) {
    return { status: 'error', message: ERROR_MESSAGES.throttled }
  }

  const provider = resolveEmailProvider()
  if (!provider) return { status: 'unconfigured' }

  try {
    await provider.send(buildContactMessage(submission))
  } catch (error) {
    const kind = error instanceof EmailError ? error.kind : 'unknown'
    console.error(`[contact] ${provider.id} ${kind}:`, error)
    return { status: 'error', message: ERROR_MESSAGES.failed }
  }

  return { status: 'sent' }
}

export { submitContactForm }
export type { ContactState }
