import { describe, expect, it } from 'vitest'

import { deriveJobRunnerToken, isJobRunnerRequest } from './job-runner'

const SECRET = 'payload-secret'

/**
 * This check is the only thing standing between the public internet and the
 * job queue's run endpoint, so the refusals matter more than the happy path.
 */
describe('isJobRunnerRequest', () => {
  it('accepte le jeton dérivé du secret', () => {
    expect(isJobRunnerRequest(`Bearer ${deriveJobRunnerToken(SECRET)}`, SECRET)).toBe(true)
  })

  it('refuse une requête sans en-tête', () => {
    expect(isJobRunnerRequest(null, SECRET)).toBe(false)
  })

  it('refuse le secret Payload envoyé tel quel', () => {
    expect(isJobRunnerRequest(`Bearer ${SECRET}`, SECRET)).toBe(false)
  })

  it('refuse un jeton dérivé d’un autre secret', () => {
    expect(isJobRunnerRequest(`Bearer ${deriveJobRunnerToken('autre')}`, SECRET)).toBe(false)
  })

  it('refuse le bon jeton sans le préfixe Bearer', () => {
    expect(isJobRunnerRequest(deriveJobRunnerToken(SECRET), SECRET)).toBe(false)
  })
})
