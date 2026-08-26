import { headers } from 'next/headers'
import { z } from 'zod'

import { computeFingerprint } from '@/lib/ai/client-fingerprint'
import { checkRateLimit } from '@/lib/ai/rate-limit'
import { setConversationFeedback } from '@/lib/conversation-store'

/**
 * Records a visitor's useful / not-useful rating on a conversation.
 *
 * A separate route from the chat because feedback arrives out of band, after the
 * answer streamed. It writes a single field on a row that holds no identity, so
 * the worst a caller can do is set a value on a conversation whose opaque id they
 * already know — still rate-limited, since a write is a write.
 */

export const dynamic = 'force-dynamic'

const feedbackSchema = z.object({
  conversationId: z.uuid(),
  rating: z.enum(['useful', 'not_useful']),
})

export async function POST(request: Request): Promise<Response> {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const parsed = feedbackSchema.safeParse(payload)
  if (!parsed.success) {
    return Response.json({ error: 'Retour invalide' }, { status: 400 })
  }

  // A write, so it shares the chat's ceiling rather than opening a free lane.
  const fingerprint = computeFingerprint(await headers())
  if (fingerprint && !checkRateLimit(fingerprint).allowed) {
    return Response.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const updated = await setConversationFeedback(parsed.data.conversationId, parsed.data.rating)
    if (!updated) return Response.json({ error: 'Conversation inconnue' }, { status: 404 })
  } catch (error) {
    console.error('[assistant] feedback not stored:', error)
    return Response.json({ error: 'Enregistrement impossible' }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
