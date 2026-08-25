import { afterEach, describe, expect, it, vi } from 'vitest'

import { createLumailProvider } from './lumail'
import { EmailError } from './provider'

import type { EmailErrorKind } from './provider'

const CONFIG = {
  apiToken: 'lum_token',
  fromEmail: 'contact@domaine.fr',
  toEmail: 'moi@example.com',
}

const MESSAGE = { subject: 'Sujet', text: 'Corps', replyTo: 'visiteur@example.com' }

/**
 * Stubs `fetch` and hands back the spy. Typed with the arguments the adapter
 * actually passes, so the recorded call can be read without casting through
 * `unknown`.
 */
const stubFetch = (response: Response | Error) => {
  const spy = vi.fn((_url: string, _init: RequestInit) =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response)
  )
  vi.stubGlobal('fetch', spy)
  return spy
}

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status })

/** Shape of the payload the adapter posts, as far as these tests inspect it. */
interface SentBody {
  to: string
  from: string
  subject: string
  content: string
  replyTo?: string
  tracking: { links: boolean; open: boolean }
}

/** Reads back the JSON body of the recorded call, typed rather than `any`. */
const sentBody = (spy: ReturnType<typeof stubFetch>): SentBody => {
  const [, init] = spy.mock.calls[0]
  return JSON.parse(init.body as string) as SentBody
}

afterEach(() => {
  vi.unstubAllGlobals()
})

/**
 * The adapter is the only place that knows Lumail's wire format. These cases pin
 * the parts a caller depends on but cannot see: that failures arrive as a typed
 * kind rather than a raw status, and that tracking stays off — link tracking
 * would rewrite URLs inside a visitor's own message.
 */
describe('createLumailProvider', () => {
  it('poste le message sur l’API avec le jeton en Bearer', async () => {
    const fetchSpy = stubFetch(jsonResponse(200, { success: true }))

    await createLumailProvider(CONFIG).send(MESSAGE)

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://lumail.io/api/v1/emails')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer lum_token')

    expect(sentBody(fetchSpy)).toMatchObject({
      to: CONFIG.toEmail,
      from: CONFIG.fromEmail,
      subject: 'Sujet',
      content: 'Corps',
      replyTo: 'visiteur@example.com',
    })
  })

  it('désactive les deux traceurs, qui n’ont rien à faire dans une notification', async () => {
    const fetchSpy = stubFetch(jsonResponse(200, { success: true }))

    await createLumailProvider(CONFIG).send(MESSAGE)

    const body = sentBody(fetchSpy)
    expect(body.tracking).toEqual({ links: false, open: false })
  })

  it('affiche un nom d’expéditeur quand il est fourni', async () => {
    const fetchSpy = stubFetch(jsonResponse(200, { success: true }))

    await createLumailProvider({ ...CONFIG, fromName: 'Portfolio' }).send(MESSAGE)

    const body = sentBody(fetchSpy)
    expect(body.from).toBe('"Portfolio" <contact@domaine.fr>')
  })

  it('retombe sur l’adresse seule sans nom', async () => {
    const fetchSpy = stubFetch(jsonResponse(200, { success: true }))

    await createLumailProvider(CONFIG).send(MESSAGE)

    const body = sentBody(fetchSpy)
    expect(body.from).toBe('contact@domaine.fr')
  })

  it.each<[number, EmailErrorKind]>([
    [400, 'bad_request'],
    [401, 'unauthorized'],
    [403, 'unauthorized'],
    [404, 'bad_request'],
    [429, 'rate_limited'],
    [500, 'provider_error'],
  ])('traduit le statut %i en %s', async (status, kind) => {
    stubFetch(jsonResponse(status, { message: 'refusé' }))

    await expect(createLumailProvider(CONFIG).send(MESSAGE)).rejects.toMatchObject({
      name: 'EmailError',
      kind,
    })
  })

  it('signale une panne réseau plutôt que de la laisser fuiter', async () => {
    stubFetch(new TypeError('fetch failed'))

    await expect(createLumailProvider(CONFIG).send(MESSAGE)).rejects.toBeInstanceOf(EmailError)
  })

  it('survit à une réponse d’erreur qui n’est pas du JSON', async () => {
    stubFetch(new Response('<html>502</html>', { status: 502 }))

    await expect(createLumailProvider(CONFIG).send(MESSAGE)).rejects.toMatchObject({
      kind: 'provider_error',
    })
  })
})

/**
 * Recipient resolution. The contact form leans on the configured inbox; account
 * recovery names its own address, and a provider configured for neither must say
 * so rather than post a message with no destination.
 */
describe('destinataire', () => {
  it('utilise le destinataire par défaut quand le message n’en nomme aucun', async () => {
    const spy = stubFetch(jsonResponse(200, { id: 'msg_1' }))

    await createLumailProvider(CONFIG).send(MESSAGE)

    expect(sentBody(spy).to).toBe(CONFIG.toEmail)
  })

  it('préfère le destinataire porté par le message', async () => {
    const spy = stubFetch(jsonResponse(200, { id: 'msg_1' }))

    await createLumailProvider(CONFIG).send({ ...MESSAGE, to: 'admin@domaine.fr' })

    expect(sentBody(spy).to).toBe('admin@domaine.fr')
  })

  it('refuse d’envoyer sans destinataire, sans appeler Lumail', async () => {
    const spy = stubFetch(jsonResponse(200, { id: 'msg_1' }))
    const { toEmail: _ignored, ...credentials } = CONFIG

    await expect(createLumailProvider(credentials).send(MESSAGE)).rejects.toMatchObject({
      kind: 'bad_request' satisfies EmailErrorKind,
    })
    expect(spy).not.toHaveBeenCalled()
  })
})
