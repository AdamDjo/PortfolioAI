import { describe, expect, it } from 'vitest'

import { allowSubmission, MAX_PER_WINDOW, WINDOW_MS } from './rate-limit'

/**
 * The limiter is process-local and shared across tests, so every case uses its
 * own key rather than resetting shared state — which is also how it behaves in
 * production, one bucket per caller.
 */
describe('allowSubmission', () => {
  it('laisse passer les premiers envois de la fenêtre', () => {
    const now = Date.now()
    for (let i = 0; i < MAX_PER_WINDOW; i += 1) {
      expect(allowSubmission('caller-a', now + i)).toBe(true)
    }
  })

  it('refuse une fois le quota de la fenêtre dépensé', () => {
    const now = Date.now()
    for (let i = 0; i < MAX_PER_WINDOW; i += 1) allowSubmission('caller-b', now + i)

    expect(allowSubmission('caller-b', now + MAX_PER_WINDOW)).toBe(false)
  })

  it('rouvre après la fenêtre, pour ne pas bannir un visiteur légitime', () => {
    const now = Date.now()
    for (let i = 0; i < MAX_PER_WINDOW; i += 1) allowSubmission('caller-c', now + i)
    expect(allowSubmission('caller-c', now + MAX_PER_WINDOW)).toBe(false)

    expect(allowSubmission('caller-c', now + WINDOW_MS + 1)).toBe(true)
  })

  it('compte chaque appelant séparément', () => {
    const now = Date.now()
    for (let i = 0; i < MAX_PER_WINDOW; i += 1) allowSubmission('caller-d', now + i)
    expect(allowSubmission('caller-d', now + MAX_PER_WINDOW)).toBe(false)

    expect(allowSubmission('caller-e', now)).toBe(true)
  })
})
