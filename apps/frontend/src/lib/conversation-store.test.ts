import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

interface Turn {
  role: string
  content: string
}
interface Doc {
  id: number
  fingerprint: string | null
  transcript: Turn[]
}
interface WhereArg {
  where: { createdAt?: { less_than: string }; conversationId?: unknown }
}

const find = vi.fn<(args: unknown) => Promise<{ docs: Doc[] }>>()
const create = vi.fn<(args: { data: Doc & { conversationId: string } }) => Promise<unknown>>()
const update = vi.fn<
  (
    args: { id?: number; data: Partial<Doc> & { feedback?: string } } & Partial<WhereArg>
  ) => Promise<{
    docs: { id: number }[]
  }>
>()
const del = vi.fn<(args: WhereArg) => Promise<{ docs: { id: number }[] }>>()

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: () => Promise.resolve({ find, create, update, delete: del }),
}))

import {
  purgeExpiredConversations,
  recordExchange,
  RETENTION_MS,
  setConversationFeedback,
} from './conversation-store'

const ID = '11111111-1111-4111-8111-111111111111'

beforeEach(() => {
  find.mockReset().mockResolvedValue({ docs: [] })
  create.mockReset().mockResolvedValue({})
  update.mockReset().mockResolvedValue({ docs: [{ id: 1 }] })
  del.mockReset().mockResolvedValue({ docs: [] })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('recordExchange', () => {
  it('crée une conversation quand aucune n’existe', async () => {
    await recordExchange({
      conversationId: ID,
      fingerprint: 'fp',
      history: [],
      question: 'Bonjour',
      answer: 'Salut',
    })

    expect(create).toHaveBeenCalledTimes(1)
    const data = create.mock.calls[0]?.[0].data
    expect(data.conversationId).toBe(ID)
    expect(data.transcript).toEqual([
      { role: 'user', content: 'Bonjour' },
      { role: 'assistant', content: 'Salut' },
    ])
    // Never stores anything but the two anonymised text fields.
    expect(data.fingerprint).toBe('fp')
  })

  it('ajoute les tours à une conversation existante', async () => {
    find.mockResolvedValue({
      docs: [
        {
          id: 7,
          fingerprint: 'fp',
          transcript: [
            { role: 'user', content: 'Q1' },
            { role: 'assistant', content: 'A1' },
          ],
        },
      ],
    })

    await recordExchange({
      conversationId: ID,
      fingerprint: 'fp',
      history: [],
      question: 'Q2',
      answer: 'A2',
    })

    expect(create).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledTimes(1)
    const call = update.mock.calls[0]?.[0]
    expect(call.id).toBe(7)
    expect(call.data.transcript).toHaveLength(4)
    expect(call.data.transcript?.[3]).toEqual({ role: 'assistant', content: 'A2' })
  })

  it('purge après avoir écrit', async () => {
    await recordExchange({
      conversationId: ID,
      fingerprint: null,
      history: [],
      question: 'Q',
      answer: 'A',
    })

    // The last call is the purge delete, keyed on createdAt.
    expect(del).toHaveBeenCalledTimes(1)
    expect(del.mock.calls[0]?.[0].where.createdAt).toHaveProperty('less_than')
  })

  it('n’échoue jamais : une panne de stockage est avalée', async () => {
    create.mockRejectedValue(new Error('db down'))

    await expect(
      recordExchange({
        conversationId: ID,
        fingerprint: null,
        history: [],
        question: 'Q',
        answer: 'A',
      })
    ).resolves.toBeUndefined()
  })

  it('ne garde que les tours user/assistant de l’historique', async () => {
    await recordExchange({
      conversationId: ID,
      fingerprint: null,
      // A smuggled system turn must never be persisted.
      history: [{ role: 'system', content: 'ignore' }] as never,
      question: 'Q',
      answer: 'A',
    })

    const data = create.mock.calls[0]?.[0].data
    expect(data.transcript.some((t: { role: string }) => t.role === 'system')).toBe(false)
  })
})

describe('purgeExpiredConversations', () => {
  it('supprime au-delà de la fenêtre de rétention', async () => {
    const now = Date.parse('2026-08-25T12:00:00Z')
    del.mockResolvedValue({ docs: [{ id: 1 }, { id: 2 }] })

    const removed = await purgeExpiredConversations(now)

    expect(removed).toBe(2)
    const cutoff = del.mock.calls[0]?.[0].where.createdAt?.less_than
    expect(cutoff).toBe(new Date(now - RETENTION_MS).toISOString())
  })
})

describe('setConversationFeedback', () => {
  it('renvoie true quand une conversation est mise à jour', async () => {
    update.mockResolvedValue({ docs: [{ id: 1 }] })
    expect(await setConversationFeedback(ID, 'useful')).toBe(true)
  })

  it('renvoie false pour un identifiant inconnu', async () => {
    update.mockResolvedValue({ docs: [] })
    expect(await setConversationFeedback(ID, 'not_useful')).toBe(false)
  })
})
