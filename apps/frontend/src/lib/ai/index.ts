import { createGroqProvider } from './groq'
import { ProviderError } from './provider'

import type { ChatProvider } from './provider'

/**
 * Resolves the configured provider.
 *
 * Selection lives in the environment rather than in the settings global, unlike
 * the model name: picking a vendor is meaningless without its API key, and a key
 * belongs in the environment, never in the database. Editing the provider from
 * `/admin` would let someone select a vendor the server cannot authenticate to.
 */

type ProviderId = 'groq'

const FACTORIES: Record<ProviderId, (apiKey: string) => ChatProvider> = {
  groq: createGroqProvider,
}

const DEFAULT_PROVIDER: ProviderId = 'groq'

const isProviderId = (value: string): value is ProviderId => value in FACTORIES

/**
 * Builds the provider from the environment, or `null` when it is not configured.
 *
 * `null` rather than a throw: a missing key is a deployment state, not a bug, and
 * the route answers it with the fallback message. Throwing here would turn a
 * portfolio without an AI key into a 500 on every question.
 */
const resolveProvider = (env: NodeJS.ProcessEnv = process.env): ChatProvider | null => {
  const requested = (env.AI_PROVIDER ?? DEFAULT_PROVIDER).trim()
  if (!isProviderId(requested)) {
    throw new ProviderError('bad_request', `Unknown AI provider: ${requested}`)
  }

  const apiKey = env.GROQ_API_KEY?.trim()
  if (!apiKey) return null

  return FACTORIES[requested](apiKey)
}

export { DEFAULT_PROVIDER, resolveProvider }
export { ProviderError } from './provider'
export type { ChatMessage, ChatProvider, CompletionRequest, ProviderErrorKind } from './provider'
