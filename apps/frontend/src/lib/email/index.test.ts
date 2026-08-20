import { describe, expect, it } from 'vitest'

import { resolveEmailProvider } from './index'

const env = (vars: Record<string, string>): NodeJS.ProcessEnv => ({ NODE_ENV: 'test', ...vars })

const COMPLETE = {
  LUMAIL_API_TOKEN: 'lum_token',
  LUMAIL_FROM_EMAIL: 'contact@domaine.fr',
  CONTACT_TO_EMAIL: 'moi@example.com',
}

/**
 * The resolver decides whether the contact form sends or falls back to a mailto.
 * What matters is that a half-configured environment resolves to `null` rather
 * than to a provider that would fail on every submission: the portfolio ships
 * before its sending domain exists, and that is a state, not a bug.
 */
describe('resolveEmailProvider', () => {
  it('retourne null quand rien n’est configuré', () => {
    expect(resolveEmailProvider(env({}))).toBeNull()
  })

  it('retourne null tant qu’il manque une des trois variables requises', () => {
    for (const missing of Object.keys(COMPLETE)) {
      const partial = { ...COMPLETE, [missing]: '' }
      expect(resolveEmailProvider(env(partial)), `sans ${missing}`).toBeNull()
    }
  })

  it('traite une valeur blanche comme absente', () => {
    expect(resolveEmailProvider(env({ ...COMPLETE, LUMAIL_API_TOKEN: '   ' }))).toBeNull()
  })

  it('construit le fournisseur quand les trois variables sont là', () => {
    expect(resolveEmailProvider(env(COMPLETE))?.id).toBe('lumail')
  })

  it('n’exige pas le nom d’expéditeur, qui n’est que cosmétique', () => {
    expect(resolveEmailProvider(env({ ...COMPLETE, LUMAIL_FROM_NAME: '' }))?.id).toBe('lumail')
  })
})
