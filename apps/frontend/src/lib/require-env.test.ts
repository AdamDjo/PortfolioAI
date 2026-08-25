import { describe, expect, it } from 'vitest'

import { requireEnv } from './require-env'

const env = (vars: Record<string, string>): NodeJS.ProcessEnv => ({ NODE_ENV: 'test', ...vars })

/**
 * The whole point of this helper is the failure path: it exists because
 * `?? ''` let a missing secret through. What matters is that nothing empty ever
 * comes back, and that the message names the variable so the fix is obvious.
 */
describe('requireEnv', () => {
  it('renvoie la valeur quand elle est présente', () => {
    expect(requireEnv('PAYLOAD_SECRET', env({ PAYLOAD_SECRET: 'un-secret' }))).toBe('un-secret')
  })

  it('supprime les espaces autour de la valeur', () => {
    expect(requireEnv('PAYLOAD_SECRET', env({ PAYLOAD_SECRET: '  un-secret  ' }))).toBe('un-secret')
  })

  it('échoue quand la variable est absente', () => {
    expect(() => requireEnv('PAYLOAD_SECRET', env({}))).toThrow(/PAYLOAD_SECRET/)
  })

  it('traite une valeur vide comme absente', () => {
    expect(() => requireEnv('DATABASE_URI', env({ DATABASE_URI: '' }))).toThrow(/DATABASE_URI/)
  })

  it('traite une valeur blanche comme absente', () => {
    expect(() => requireEnv('DATABASE_URI', env({ DATABASE_URI: '   ' }))).toThrow(/DATABASE_URI/)
  })
})
