/**
 * Provider-agnostic contract for the chat model.
 *
 * The route and the context builder depend on this interface alone, so swapping
 * Groq for another vendor means adding a file next to `groq.ts` — nothing else
 * moves. It is deliberately narrow: one streaming call, because that is all the
 * assistant does.
 */

/** A conversation turn, in the shape every chat API expects. */
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface CompletionRequest {
  model: string
  messages: ChatMessage[]
  /** Aborts the upstream call; the route turns this into the fallback message. */
  signal?: AbortSignal
}

/**
 * Why a call failed, in the terms the UI cares about.
 *
 * The distinction is not cosmetic: `quota` and `unavailable` are the provider's
 * fault and must show the fallback message, while `bad_request` means we sent
 * something wrong and deserves a log rather than a soothing sentence.
 */
type ProviderErrorKind = 'quota' | 'timeout' | 'unavailable' | 'bad_request'

class ProviderError extends Error {
  readonly kind: ProviderErrorKind

  constructor(kind: ProviderErrorKind, message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ProviderError'
    this.kind = kind
  }
}

interface ChatProvider {
  /** Identifier used in logs and in the settings global. */
  readonly id: string
  /**
   * Streams the answer as plain text chunks.
   *
   * Text rather than provider-specific events: the caller must never have to
   * know how a vendor frames its payloads.
   */
  streamCompletion(request: CompletionRequest): AsyncIterable<string>
}

export { ProviderError }
export type { ChatMessage, ChatProvider, CompletionRequest, ProviderErrorKind }
