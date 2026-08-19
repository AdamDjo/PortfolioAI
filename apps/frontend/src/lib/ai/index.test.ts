import { describe, expect, it } from 'vitest'

import { DEFAULT_PROVIDER, ProviderError, resolveProvider } from './index'

/**
 * `ProcessEnv` requires `NODE_ENV`, which none of these cases care about: this
 * keeps the env literals readable without a cast on every call.
 */
const env = (vars: Record<string, string>): NodeJS.ProcessEnv => ({ NODE_ENV: 'test', ...vars })

/**
 * Provider selection decides whether the assistant answers at all, so the
 * distinction that matters here is between a missing key — a deployment state the
 * route must survive by showing its fallback — and a bad configuration, which is
 * a mistake worth surfacing loudly.
 */
describe('resolveProvider', () => {
  it('retourne null sans clé, pour laisser la route répondre son message de repli', () => {
    expect(resolveProvider(env({}))).toBeNull()
  })

  it('traite une clé vide ou blanche comme absente', () => {
    expect(resolveProvider(env({ GROQ_API_KEY: '   ' }))).toBeNull()
  })

  it('choisit Groq par défaut quand la clé est là', () => {
    const provider = resolveProvider(env({ GROQ_API_KEY: 'k' }))
    expect(provider?.id).toBe(DEFAULT_PROVIDER)
  })

  it('accepte un fournisseur nommé explicitement', () => {
    const provider = resolveProvider(env({ AI_PROVIDER: 'groq', GROQ_API_KEY: 'k' }))
    expect(provider?.id).toBe('groq')
  })

  it('rejette un fournisseur inconnu au lieu de retomber silencieusement sur Groq', () => {
    // Silently ignoring the variable would make a typo look like it worked.
    expect(() => resolveProvider(env({ AI_PROVIDER: 'openai', GROQ_API_KEY: 'k' }))).toThrow(
      ProviderError
    )
  })

  it('rejette le fournisseur inconnu même sans clé', () => {
    expect(() => resolveProvider(env({ AI_PROVIDER: 'mistral' }))).toThrow(ProviderError)
  })
})
