import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The action is the only thing standing between a public form and a billed
 * vendor, so what is pinned here is the behaviour that is invisible from the
 * page: that a tripped honeypot looks exactly like a success, that a submission
 * is never forwarded when the trap fires, and that an unconfigured environment
 * is reported as its own state rather than as a failure.
 *
 * `next/headers` and the provider are mocked at the module boundary: what is
 * under test is the decision flow, not Next's request plumbing nor Lumail.
 */

const send = vi.fn<(message: unknown) => Promise<void>>()
const resolveEmailProvider = vi.fn<() => { id: string; send: typeof send } | null>()

/**
 * A distinct caller per test: the limiter is process-local and shared across
 * cases, so a fixed address would make each test spend the next one's quota.
 */
let caller = 0
vi.mock('next/headers', () => ({
  headers: () => Promise.resolve(new Headers({ 'x-forwarded-for': `203.0.113.${caller}` })),
}))

/**
 * Only the resolver is replaced; everything else is kept as the real module.
 * `EmailError` in particular: the action narrows on `instanceof`, so a stubbed
 * class would silently take the `unknown` branch and the error path under test
 * would no longer be the production one.
 *
 * The real module is loaded inside the factory rather than imported at the top:
 * `vi.mock` is hoisted above the imports, and a top-level binding into the very
 * module being mocked is read before it is initialised.
 */
interface EmailModule {
  resolveEmailProvider: unknown
}

vi.mock('@/lib/email', async () => {
  const actual = await vi.importActual<EmailModule>('@/lib/email')
  return { ...actual, resolveEmailProvider: () => resolveEmailProvider() }
})

const { submitContactForm } = await import('./_actions')

const formData = (fields: Record<string, string>): FormData => {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.append(key, value)
  return data
}

const VALID = {
  name: 'Camille',
  email: 'camille@example.com',
  subject: 'Une mission',
  message: 'Bonjour, deux mots sur le projet.',
}

const submit = (fields: Record<string, string>) =>
  submitContactForm({ status: 'idle' }, formData(fields))

beforeEach(() => {
  caller += 1
  send.mockReset().mockResolvedValue(undefined)
  resolveEmailProvider.mockReset().mockReturnValue({ id: 'lumail', send })
})

describe('submitContactForm', () => {
  it('envoie le message quand tout est valide', async () => {
    const state = await submit(VALID)

    expect(state.status).toBe('sent')
    expect(send).toHaveBeenCalledOnce()
  })

  it('annonce un succès sans rien envoyer quand le piège est rempli', async () => {
    // A bot told it was caught is a bot whose next attempt works.
    const state = await submit({ ...VALID, website: 'http://spam.example' })

    expect(state.status).toBe('sent')
    expect(send).not.toHaveBeenCalled()
  })

  it('ignore un piège rempli d’espaces, qui vient d’un autofill', async () => {
    const state = await submit({ ...VALID, website: '   ' })

    expect(state.status).toBe('sent')
    expect(send).toHaveBeenCalledOnce()
  })

  it('signale l’absence de configuration comme un état, pas comme une panne', async () => {
    resolveEmailProvider.mockReturnValue(null)

    const state = await submit(VALID)

    expect(state.status).toBe('unconfigured')
  })

  it('refuse une adresse invalide sans appeler le fournisseur', async () => {
    const state = await submit({ ...VALID, email: 'pas-une-adresse' })

    expect(state.status).toBe('error')
    expect(send).not.toHaveBeenCalled()
  })

  it('refuse un message vide', async () => {
    expect((await submit({ ...VALID, message: '   ' })).status).toBe('error')
  })

  it('rend une erreur lisible quand le fournisseur échoue', async () => {
    send.mockRejectedValue(new Error('Lumail down'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const state = await submit(VALID)

    expect(state.status).toBe('error')
    // The vendor's own wording never reaches the visitor.
    if (state.status === 'error') expect(state.message).not.toContain('Lumail')
  })
})
