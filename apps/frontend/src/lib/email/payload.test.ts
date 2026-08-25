import { describe, expect, it, vi } from 'vitest'

import { createPayloadEmailAdapter, resolvePayloadEmailAdapter } from './payload'
import { EmailError } from './provider'

import type { EmailMessage, EmailProvider } from './provider'
import type { Payload } from 'payload'

const env = (vars: Record<string, string>): NodeJS.ProcessEnv => ({ NODE_ENV: 'test', ...vars })

const CREDENTIALS = {
  LUMAIL_API_TOKEN: 'lum_token',
  LUMAIL_FROM_EMAIL: 'contact@domaine.fr',
}

/** Records what the transport was asked to send, without reaching the network. */
const stubSender = () => {
  const send = vi.fn<(message: EmailMessage) => Promise<void>>(() => Promise.resolve())
  const provider: EmailProvider = { id: 'lumail', send }

  return { send, sender: { provider, fromEmail: 'contact@domaine.fr', fromName: 'Portfolio' } }
}

/** Payload passes itself to the adapter factory; nothing here reads it. */
const initialize = (adapter: ReturnType<typeof createPayloadEmailAdapter>) =>
  adapter({ payload: {} as Payload })

describe('createPayloadEmailAdapter', () => {
  it('annonce le fournisseur et son expéditeur par défaut', () => {
    const { sender } = stubSender()
    const adapter = initialize(createPayloadEmailAdapter(sender))

    expect(adapter.name).toBe('lumail')
    expect(adapter.defaultFromAddress).toBe('contact@domaine.fr')
    expect(adapter.defaultFromName).toBe('Portfolio')
  })

  it('retombe sur l’adresse quand aucun nom d’expéditeur n’est configuré', () => {
    const { sender } = stubSender()
    const adapter = initialize(createPayloadEmailAdapter({ ...sender, fromName: undefined }))

    expect(adapter.defaultFromName).toBe('contact@domaine.fr')
  })

  it('transmet le destinataire de Payload au transport', async () => {
    const { send, sender } = stubSender()
    const adapter = initialize(createPayloadEmailAdapter(sender))

    await adapter.sendEmail({ to: 'admin@domaine.fr', subject: 'Sujet', html: 'Corps' })

    expect(send).toHaveBeenCalledWith({
      to: 'admin@domaine.fr',
      subject: 'Sujet',
      text: 'Corps',
    })
  })

  it('préfère le corps texte quand Payload en fournit un', async () => {
    const { send, sender } = stubSender()
    const adapter = initialize(createPayloadEmailAdapter(sender))

    await adapter.sendEmail({
      to: 'admin@domaine.fr',
      subject: 'Sujet',
      html: 'HTML',
      text: 'Texte',
    })

    expect(send.mock.calls[0]?.[0].text).toBe('Texte')
  })

  /**
   * A reset link is addressed to one account. Nodemailer's type allows a list and
   * an object form, and picking one entry out of them would mean mailing a link
   * to an address nobody asked about.
   */
  it('refuse un destinataire qui n’est pas une adresse simple', async () => {
    const { send, sender } = stubSender()
    const adapter = initialize(createPayloadEmailAdapter(sender))

    await expect(
      adapter.sendEmail({ to: ['un@example.com', 'deux@example.com'], subject: 'Sujet', html: 'x' })
    ).rejects.toBeInstanceOf(EmailError)
    expect(send).not.toHaveBeenCalled()
  })

  it('refuse un message sans sujet ni corps', async () => {
    const { sender } = stubSender()
    const adapter = initialize(createPayloadEmailAdapter(sender))

    await expect(adapter.sendEmail({ to: 'admin@domaine.fr', html: 'x' })).rejects.toBeInstanceOf(
      EmailError
    )
    await expect(
      adapter.sendEmail({ to: 'admin@domaine.fr', subject: 'Sujet' })
    ).rejects.toBeInstanceOf(EmailError)
  })
})

/**
 * Recovery is wired only when the environment can send. An admin deployed before
 * its sending domain exists must still boot — Payload reports email as
 * unconfigured, which is the truth, instead of accepting a reset it cannot deliver.
 */
describe('resolvePayloadEmailAdapter', () => {
  it('ne renvoie rien quand aucun expéditeur n’est configuré', () => {
    expect(resolvePayloadEmailAdapter(env({}))).toBeUndefined()
  })

  it('n’exige pas le destinataire du formulaire de contact', () => {
    expect(resolvePayloadEmailAdapter(env(CREDENTIALS))).toBeTypeOf('function')
  })
})
