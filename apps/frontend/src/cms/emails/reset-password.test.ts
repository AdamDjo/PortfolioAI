import { afterEach, describe, expect, it } from 'vitest'

import { buildResetPasswordEmail, RESET_PASSWORD_SUBJECT } from './reset-password'

const TOKEN = 'a1b2c3'

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SERVER_URL
})

/**
 * The message is worth testing for one reason: a reset link that points at the
 * wrong host is a dead account. The rest is prose.
 */
describe('buildResetPasswordEmail', () => {
  it('construit le lien sur l’origine de la requête', () => {
    const body = buildResetPasswordEmail({ token: TOKEN, requestOrigin: 'https://adem.dev' })

    expect(body).toContain(`https://adem.dev/admin/reset/${TOKEN}`)
  })

  it('préfère l’origine de la requête à l’environnement', () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://staging.adem.dev'

    const body = buildResetPasswordEmail({ token: TOKEN, requestOrigin: 'https://adem.dev' })

    expect(body).toContain('https://adem.dev/admin/reset/')
    expect(body).not.toContain('staging')
  })

  it('retombe sur l’environnement hors contexte de requête', () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://adem.dev'

    expect(buildResetPasswordEmail({ token: TOKEN })).toContain(
      `https://adem.dev/admin/reset/${TOKEN}`
    )
  })

  it('retombe sur l’hôte local quand rien n’est configuré', () => {
    expect(buildResetPasswordEmail({ token: TOKEN })).toContain(
      `http://localhost:3000/admin/reset/${TOKEN}`
    )
  })

  it('écrit l’URL seule sur sa ligne, sans balise', () => {
    const body = buildResetPasswordEmail({ token: TOKEN, requestOrigin: 'https://adem.dev' })

    expect(body).not.toContain('<a')
    expect(body.split('\n')).toContain(`https://adem.dev/admin/reset/${TOKEN}`)
  })

  it('annonce l’expiration et la marche à suivre en cas de demande non sollicitée', () => {
    const body = buildResetPasswordEmail({ token: TOKEN })

    expect(body).toContain('expire')
    expect(body).toContain('ignorez ce message')
  })

  it('porte un sujet explicite', () => {
    expect(RESET_PASSWORD_SUBJECT).toMatch(/mot de passe/i)
  })
})
