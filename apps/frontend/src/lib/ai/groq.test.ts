import { afterEach, describe, expect, it, vi } from 'vitest'

import { createGroqProvider, GROQ_ENDPOINT } from './groq'
import { ProviderError } from './provider'

/**
 * The provider is the one place that touches a third party, so these tests pin
 * down the two things the route depends on: what a stream yields, and which
 * `kind` a failure carries — the route picks its fallback from that kind alone.
 *
 * `fetch` is stubbed rather than hitting Groq: a test suite that needs an API key
 * and a network is a test suite that gets skipped.
 */

/** Builds a response whose body streams the given SSE frames. */
const sseResponse = (frames: string[]): Response => {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder()
      for (const frame of frames) controller.enqueue(encoder.encode(frame))
      controller.close()
    },
  })
  return new Response(stream, { status: 200 })
}

const dataFrame = (content: string): string =>
  `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n`

const collect = async (provider = createGroqProvider('test-key')): Promise<string[]> => {
  const chunks: string[] = []
  for await (const chunk of provider.streamCompletion({
    model: 'openai/gpt-oss-20b',
    messages: [{ role: 'user', content: 'Bonjour' }],
  })) {
    chunks.push(chunk)
  }
  return chunks
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createGroqProvider — flux', () => {
  it('restitue les deltas dans l’ordre', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(sseResponse([dataFrame('Bon'), dataFrame('jour'), 'data: [DONE]\n']))
      )
    )

    expect(await collect()).toEqual(['Bon', 'jour'])
  })

  it('ignore les lignes vides et le sentinel de fin', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(sseResponse(['\n', dataFrame('Salut'), '\n', 'data: [DONE]\n', '\n']))
      )
    )

    expect(await collect()).toEqual(['Salut'])
  })

  it('recolle une trame coupée entre deux paquets réseau', async () => {
    // A chunk boundary can fall anywhere, including mid-JSON: the buffer has to
    // hold the partial line until the rest arrives.
    const frame = dataFrame('Disponible')
    const cut = Math.floor(frame.length / 2)
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(sseResponse([frame.slice(0, cut), frame.slice(cut), 'data: [DONE]\n']))
      )
    )

    expect(await collect()).toEqual(['Disponible'])
  })

  it('ignore une trame au JSON invalide sans interrompre le flux', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(sseResponse([dataFrame('a'), 'data: {oops\n', dataFrame('b')])))
    )

    expect(await collect()).toEqual(['a', 'b'])
  })

  it('ignore une trame sans contenu (rôle seul, arrêt)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          sseResponse([
            `data: ${JSON.stringify({ choices: [{ delta: { role: 'assistant' } }] })}\n`,
            dataFrame('Texte'),
            `data: ${JSON.stringify({ choices: [{ finish_reason: 'stop' }] })}\n`,
          ])
        )
      )
    )

    expect(await collect()).toEqual(['Texte'])
  })

  it('envoie la clé et demande le streaming', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(sseResponse(['data: [DONE]\n'])))
    vi.stubGlobal('fetch', fetchMock)

    await collect(createGroqProvider('secret-key'))

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(GROQ_ENDPOINT)
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secret-key')
    expect(JSON.parse(init.body as string)).toMatchObject({
      model: 'openai/gpt-oss-20b',
      stream: true,
    })
  })
})

describe('createGroqProvider — erreurs', () => {
  /**
   * The route maps `kind` to a user-facing outcome, so a wrong classification is
   * a wrong message: a quota hit must never read as a bad request.
   */
  it.each([
    [429, 'quota'],
    [402, 'quota'],
    [500, 'unavailable'],
    [503, 'unavailable'],
    [400, 'bad_request'],
    [401, 'bad_request'],
  ])('classe le statut %i en « %s »', async (status, kind) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('refus', { status })))
    )

    await expect(collect()).rejects.toMatchObject({ kind })
  })

  it('signale une panne réseau comme indisponibilité', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('fetch failed')))
    )

    const error = await collect().catch((cause: unknown) => cause)
    expect(error).toBeInstanceOf(ProviderError)
    expect(error).toMatchObject({ kind: 'unavailable' })
  })

  it('propage l’annulation du client sans la convertir en erreur fournisseur', async () => {
    // A visitor leaving the page is not an outage: turning it into one would show
    // a failure message to someone who is no longer there, and hide real ones.
    const controller = new AbortController()
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) => {
        controller.abort()
        return Promise.reject(
          Object.assign(new Error('aborted'), { name: 'AbortError', signal: init.signal })
        )
      })
    )

    const provider = createGroqProvider('test-key')
    const run = async () => {
      for await (const _chunk of provider.streamCompletion({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: 'Bonjour' }],
        signal: controller.signal,
      })) {
        // draining is enough: the throw happens before the first chunk
      }
    }

    await expect(run()).rejects.not.toBeInstanceOf(ProviderError)
  })
})
