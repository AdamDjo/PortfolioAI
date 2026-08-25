import { getPayload } from 'payload'

import config from '@payload-config'

import type { ChatMessage } from '@/lib/ai'

/**
 * Persistence for the public assistant's transcripts.
 *
 * Kept out of the route so the route stays about answering, and so the retention
 * rule lives in one place. Everything here writes with `overrideAccess`: it runs
 * on the server with no visitor identity, and the collection is otherwise sealed
 * to the admin.
 */

/** How long an anonymised transcript is kept before it is deleted. */
const RETENTION_DAYS = 30

const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000

/** A stored turn. Mirrors the chat's own message shape, minus the system turn. */
interface StoredTurn {
  role: 'user' | 'assistant'
  content: string
}

const toTurns = (history: ChatMessage[]): StoredTurn[] =>
  history
    .filter((turn): turn is StoredTurn => turn.role === 'user' || turn.role === 'assistant')
    .map(({ role, content }) => ({ role, content }))

/**
 * Records one exchange, appending it to its conversation.
 *
 * Upsert by the client's opaque id: a new conversation is created, an existing
 * one has the question and answer appended so a multi-turn chat stays one row.
 * Deliberately swallows its own failures — the answer has already reached the
 * visitor, and a storage hiccup must never surface as a chat error. The purge is
 * fired here rather than on a schedule the app does not have: activity is what
 * keeps the table within its retention window.
 */
const recordExchange = async ({
  conversationId,
  fingerprint,
  history,
  question,
  answer,
}: {
  conversationId: string
  fingerprint: string | null
  history: ChatMessage[]
  question: string
  answer: string
}): Promise<void> => {
  try {
    const payload = await getPayload({ config })

    const existing = await payload.find({
      collection: 'conversations',
      where: { conversationId: { equals: conversationId } },
      limit: 1,
      overrideAccess: true,
    })

    const previous = existing.docs[0]
    const turns: StoredTurn[] = [
      ...(previous ? toTurns((previous.transcript as ChatMessage[]) ?? []) : toTurns(history)),
      { role: 'user', content: question },
      { role: 'assistant', content: answer },
    ]

    if (previous) {
      await payload.update({
        collection: 'conversations',
        id: previous.id,
        data: { transcript: turns, fingerprint: fingerprint ?? previous.fingerprint },
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'conversations',
        data: { conversationId, fingerprint, transcript: turns },
        overrideAccess: true,
      })
    }

    await purgeExpiredConversations()
  } catch (error) {
    console.error('[assistant] transcript not stored:', error)
  }
}

/**
 * Sets the visitor's feedback on a conversation.
 *
 * Returns whether a row was updated, so the route can answer 404 for an unknown
 * id without leaking whether it ever existed.
 */
const setConversationFeedback = async (
  conversationId: string,
  feedback: 'useful' | 'not_useful'
): Promise<boolean> => {
  const payload = await getPayload({ config })

  const result = await payload.update({
    collection: 'conversations',
    where: { conversationId: { equals: conversationId } },
    data: { feedback },
    overrideAccess: true,
  })

  return result.docs.length > 0
}

/**
 * Deletes every transcript past its retention window.
 *
 * Runs opportunistically on write rather than on a cron the app does not own: a
 * quiet site keeps almost nothing, and an active one sweeps itself. Payload
 * timestamps `createdAt` on every row, so the cutoff is a plain comparison.
 */
const purgeExpiredConversations = async (now: number = Date.now()): Promise<number> => {
  const payload = await getPayload({ config })
  const cutoff = new Date(now - RETENTION_MS).toISOString()

  const result = await payload.delete({
    collection: 'conversations',
    where: { createdAt: { less_than: cutoff } },
    overrideAccess: true,
  })

  return result.docs.length
}

export {
  recordExchange,
  setConversationFeedback,
  purgeExpiredConversations,
  RETENTION_DAYS,
  RETENTION_MS,
}
