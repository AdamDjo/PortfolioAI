import { describe, expect, it } from 'vitest'

import { Users } from './users'

import type { PayloadRequest } from 'payload'

/** The collection declares `auth` as an object; this narrows it for the assertions. */
const auth = typeof Users.auth === 'object' ? Users.auth : null

/**
 * These assertions guard configuration, not behaviour, and that is deliberate:
 * every value here is one an upstream default would otherwise decide silently.
 * A Payload upgrade that raises the brute-force ceiling, or a refactor that drops
 * the reset template and falls back to the HTML one the transport cannot render,
 * fails here instead of in production.
 */
describe('collection users', () => {
  it('plafonne les tentatives de connexion', () => {
    expect(auth?.maxLoginAttempts).toBe(5)
  })

  it('verrouille le compte dix minutes', () => {
    expect(auth?.lockTime).toBe(600_000)
  })

  it('n’ouvre la création de compte qu’à une session authentifiée', () => {
    const create = Users.access?.create

    expect(create?.({ req: {} } as Parameters<NonNullable<typeof create>>[0])).toBe(false)
  })

  it('compose lui-même le message de réinitialisation', async () => {
    const req = { origin: 'https://adem.dev' } as PayloadRequest
    const body = await auth?.forgotPassword?.generateEmailHTML?.({ req, token: 'tok' })

    expect(body).toContain('https://adem.dev/admin/reset/tok')
  })

  it('donne un sujet au message de réinitialisation', async () => {
    const subject = await auth?.forgotPassword?.generateEmailSubject?.({})

    expect(subject).toMatch(/mot de passe/i)
  })
})
