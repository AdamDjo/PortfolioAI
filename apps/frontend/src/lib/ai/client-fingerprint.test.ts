import { describe, expect, it } from 'vitest'

import { computeFingerprint } from './client-fingerprint'

const env = (vars: Record<string, string>): NodeJS.ProcessEnv => ({ NODE_ENV: 'test', ...vars })

const SALT = env({ CHAT_FINGERPRINT_SALT: 'un-sel-secret' })

const withIp = (ip: string): Headers => new Headers({ 'x-forwarded-for': ip })

// Two instants on different UTC days.
const DAY_1 = Date.parse('2026-08-24T12:00:00Z')
const DAY_2 = Date.parse('2026-08-25T12:00:00Z')

describe('computeFingerprint', () => {
  it('produit une empreinte stable pour une même IP le même jour', () => {
    const a = computeFingerprint(withIp('203.0.113.7'), SALT, DAY_1)
    const b = computeFingerprint(withIp('203.0.113.7'), SALT, DAY_1)

    expect(a).toBe(b)
  })

  it('distingue deux adresses différentes', () => {
    const a = computeFingerprint(withIp('203.0.113.7'), SALT, DAY_1)
    const b = computeFingerprint(withIp('203.0.113.8'), SALT, DAY_1)

    expect(a).not.toBe(b)
  })

  it('change l’empreinte d’un jour à l’autre pour la même IP', () => {
    const day1 = computeFingerprint(withIp('203.0.113.7'), SALT, DAY_1)
    const day2 = computeFingerprint(withIp('203.0.113.7'), SALT, DAY_2)

    expect(day1).not.toBe(day2)
  })

  it('dépend du sel : un sel différent donne une empreinte différente', () => {
    const a = computeFingerprint(withIp('203.0.113.7'), SALT, DAY_1)
    const b = computeFingerprint(
      withIp('203.0.113.7'),
      env({ CHAT_FINGERPRINT_SALT: 'autre-sel' }),
      DAY_1
    )

    expect(a).not.toBe(b)
  })

  it('ne contient jamais l’adresse en clair', () => {
    const fingerprint = computeFingerprint(withIp('203.0.113.7'), SALT, DAY_1)

    expect(fingerprint).not.toContain('203.0.113.7')
    expect(fingerprint).toMatch(/^[0-9a-f]{64}$/)
  })

  it('prend la première entrée de x-forwarded-for', () => {
    const chained = new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1, 10.0.0.2' })
    const single = withIp('203.0.113.7')

    expect(computeFingerprint(chained, SALT, DAY_1)).toBe(computeFingerprint(single, SALT, DAY_1))
  })

  it('retombe sur x-real-ip quand x-forwarded-for est absent', () => {
    const real = new Headers({ 'x-real-ip': '203.0.113.7' })

    expect(computeFingerprint(real, SALT, DAY_1)).toBeTypeOf('string')
  })

  it('regroupe les appelants non identifiés sous le même seau', () => {
    const a = computeFingerprint(new Headers(), SALT, DAY_1)
    const b = computeFingerprint(new Headers(), SALT, DAY_1)

    expect(a).toBe(b)
  })

  it('reste null sans sel : impossible d’anonymiser, donc pas d’empreinte', () => {
    expect(computeFingerprint(withIp('203.0.113.7'), env({}), DAY_1)).toBeNull()
    expect(
      computeFingerprint(withIp('203.0.113.7'), env({ CHAT_FINGERPRINT_SALT: '  ' }), DAY_1)
    ).toBeNull()
  })
})
