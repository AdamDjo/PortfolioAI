import { headers } from 'next/headers'
import { z } from 'zod'

import { ProviderError, resolveProvider } from '@/lib/ai'
import { computeFingerprint } from '@/lib/ai/client-fingerprint'
import { checkRateLimit } from '@/lib/ai/rate-limit'
import { buildContext, getAssistantConfig } from '@/lib/assistant-context'

import type { ChatMessage } from '@/lib/ai'

/**
 * Public endpoint behind the hero chat.
 *
 * It streams plain text rather than JSON events: the client appends what it
 * receives, so there is no protocol to keep in sync on both sides.
 *
 * A static segment wins over Payload's `/api/[...slug]` catch-all, so this path
 * is ours without any routing configuration.
 */

/** Dynamic by nature: every question is different and nothing here is cacheable. */
export const dynamic = 'force-dynamic'

/** Long enough for a full answer, short enough to release a stuck worker. */
export const maxDuration = 30

/**
 * Bounds are validation, not politeness: the question is concatenated into a
 * prompt billed by the token, and the history is replayed on every turn.
 */
const MAX_QUESTION_LENGTH = 1_000
const MAX_HISTORY_TURNS = 8

const requestSchema = z.object({
  question: z.string().trim().min(1, 'Question vide').max(MAX_QUESTION_LENGTH),
  /**
   * Prior turns, sent by the client because the server keeps no session. They are
   * capped and re-validated: this is visitor input like any other, and a caller
   * could otherwise smuggle in an arbitrary system message.
   */
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(MAX_QUESTION_LENGTH),
      })
    )
    .max(MAX_HISTORY_TURNS)
    .optional(),
})

/** Plain-text stream, marked no-store so no proxy replays one visitor's answer to another. */
const streamHeaders = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Accel-Buffering': 'no',
} as const

/**
 * Shown when a caller has spent their allowance.
 *
 * It reads as the assistant's own reply and sends the visitor to the contact
 * page, so a real person who happened to hit the ceiling still has a way through
 * rather than a dead error.
 */
const RATE_LIMITED_MESSAGE =
  'Vous avez posé beaucoup de questions d’affilée. Laissez souffler l’assistant une minute, ou écrivez-moi directement depuis la page /contact.'

/**
 * Answers with the editable fallback and HTTP 200.
 *
 * 200 rather than 503 because this *is* the answer as far as the visitor is
 * concerned: the chat shows a sentence explaining the assistant is unreachable,
 * which the client handles as content, not as a failure to report.
 */
const fallbackResponse = (message: string): Response =>
  new Response(message, { status: 200, headers: streamHeaders })

export async function POST(request: Request): Promise<Response> {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(payload)
  if (!parsed.success) {
    return Response.json({ error: 'Question invalide' }, { status: 400 })
  }

  // Throttle before touching the provider: a refused caller must cost no token
  // and reach no context build. The fingerprint is anonymous and per-day; when
  // no salt is configured it is null, and the limiter stays off rather than
  // bucketing everyone together — see computeFingerprint.
  const fingerprint = computeFingerprint(await headers())
  if (fingerprint) {
    const verdict = checkRateLimit(fingerprint)
    if (!verdict.allowed) {
      console.warn(`[assistant] rate-limited: ${verdict.reason}`)
      return new Response(RATE_LIMITED_MESSAGE, { status: 429, headers: streamHeaders })
    }
  }

  const settings = await getAssistantConfig()
  if (!settings.enabled) return fallbackResponse(settings.unavailableMessage)

  let provider
  try {
    provider = resolveProvider()
  } catch {
    // An unknown provider name is a misconfiguration; the visitor still gets a
    // sentence rather than a stack trace.
    return fallbackResponse(settings.unavailableMessage)
  }
  if (!provider) return fallbackResponse(settings.unavailableMessage)

  const context = await buildContext()

  const messages: ChatMessage[] = [
    { role: 'system', content: `${settings.systemPrompt}\n\n# Contexte\n\n${context}` },
    ...(parsed.data.history ?? []),
    { role: 'user', content: parsed.data.question },
  ]

  const encoder = new TextEncoder()
  let started = false

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of provider.streamCompletion({
          model: settings.model,
          messages,
          signal: request.signal,
        })) {
          started = true
          controller.enqueue(encoder.encode(delta))
        }
      } catch (error) {
        if (request.signal.aborted) {
          // The visitor navigated away: nothing left to tell anyone.
          controller.close()
          return
        }

        const kind = error instanceof ProviderError ? error.kind : 'unavailable'
        console.error(`[assistant] ${kind}:`, error)

        // Once tokens are out, the fallback can only be appended — replacing the
        // text would need a protocol the client does not speak. A half answer
        // followed by the notice still beats a sentence cut mid-word.
        const notice = started ? `\n\n${settings.unavailableMessage}` : settings.unavailableMessage
        controller.enqueue(encoder.encode(notice))
      }
      controller.close()
    },
  })

  return new Response(stream, { status: 200, headers: streamHeaders })
}
