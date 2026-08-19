import { ProviderError } from './provider'

import type { ChatProvider, CompletionRequest } from './provider'

/**
 * Groq implementation of `ChatProvider`.
 *
 * Written against `fetch` rather than the vendor SDK: the surface used here is
 * one POST and an SSE stream, and the whole point of `ChatProvider` is that this
 * file stays replaceable. A dependency would add weight to the server bundle and
 * a second abstraction on top of the one we already define.
 */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

/**
 * Groq is fast — first tokens usually land well under a second. Fifteen seconds
 * is therefore not a normal wait but a signal that something is wrong, and the
 * visitor gets the fallback instead of a spinner that never resolves.
 */
const REQUEST_TIMEOUT_MS = 15_000

/** SSE terminator, per the OpenAI-compatible protocol Groq implements. */
const STREAM_DONE = '[DONE]'

/** Shape of the delta frames; every other field of the chunk is ignored. */
interface StreamChunk {
  choices?: { delta?: { content?: string | null } }[]
}

/**
 * Maps an HTTP status to a failure kind.
 *
 * 429 and 402 mean the account hit its limits, which the issue calls out
 * explicitly: it must read as "come back later", never as a broken page. 5xx is
 * the provider being down. Anything else points at our own request.
 */
const kindForStatus = (status: number): ProviderError['kind'] => {
  if (status === 429 || status === 402) return 'quota'
  if (status >= 500) return 'unavailable'
  return 'bad_request'
}

/** Reads one SSE `data:` line, returning the text delta it carries. */
const readDelta = (line: string): string | null => {
  if (!line.startsWith('data:')) return null

  const payload = line.slice(5).trim()
  if (payload === '' || payload === STREAM_DONE) return null

  try {
    const chunk = JSON.parse(payload) as StreamChunk
    return chunk.choices?.[0]?.delta?.content ?? null
  } catch {
    // A truncated frame is not worth failing the whole answer over: the next
    // chunk carries the rest, and dropping one delta degrades gracefully.
    return null
  }
}

const ignoreCancelError = (): void => undefined

const createGroqProvider = (apiKey: string): ChatProvider => ({
  id: 'groq',

  async *streamCompletion({ model, messages, signal }: CompletionRequest) {
    // Times the request out on our side while still honouring an upstream abort
    // (the visitor navigating away), so a hung provider cannot pin the handler.
    const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    const abort = signal ? AbortSignal.any([signal, timeout]) : timeout

    let response: Response
    try {
      response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages, stream: true }),
        signal: abort,
      })
    } catch (error) {
      // The caller's own abort is not a provider failure: let it propagate so the
      // route can stay silent instead of showing an error to someone who left.
      if (signal?.aborted) throw error
      if (timeout.aborted) {
        throw new ProviderError('timeout', 'Groq did not respond in time', { cause: error })
      }
      throw new ProviderError('unavailable', 'Groq is unreachable', { cause: error })
    }

    if (!response.ok || !response.body) {
      // Read the body for the log only: a provider message must never reach the
      // visitor, who gets the editable fallback instead.
      const detail = await response.text().catch(() => '')
      throw new ProviderError(
        kindForStatus(response.status),
        `Groq responded ${response.status}: ${detail.slice(0, 200)}`
      )
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
    // Frames are split across network chunks, so a partial line is kept until
    // its newline arrives.
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += value
        const lines = buffer.split('\n')
        // The last element is either an incomplete line or an empty string.
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const delta = readDelta(line)
          if (delta) yield delta
        }
      }
    } finally {
      // Releases the connection when the consumer stops early, which happens on
      // every abandoned page. A cancel that fails has nothing left to release,
      // and must not mask the reason the loop exited.
      await reader.cancel().catch(ignoreCancelError)
    }
  },
})

export { createGroqProvider, GROQ_ENDPOINT, REQUEST_TIMEOUT_MS }
