import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Credentials for the server's own calls to `/api/payload-jobs/run`.
 *
 * The queue is run over HTTP rather than in-process because a job publishing an
 * article fires the collection's `afterChange` hook, and `revalidatePath` only
 * works inside a Next request: from a bare timer it throws, and the prerendered
 * pages would keep serving the article as missing.
 *
 * The token is derived from `PAYLOAD_SECRET` instead of being a variable of its
 * own, so there is nothing extra to configure — and therefore nothing to forget
 * — for scheduled publishing to work. The HMAC keeps the secret itself off the
 * wire and out of any log that records request headers.
 */
const deriveJobRunnerToken = (secret: string): string =>
  createHmac('sha256', secret).update('payload-jobs:run').digest('hex')

/** True when the `Authorization` header carries the job runner's token. */
const isJobRunnerRequest = (authorization: string | null, secret: string): boolean => {
  const prefix = 'Bearer '
  if (!authorization?.startsWith(prefix)) return false

  const received = Buffer.from(authorization.slice(prefix.length))
  const expected = Buffer.from(deriveJobRunnerToken(secret))
  // timingSafeEqual throws on a length mismatch, which a wrong token may have.
  return received.length === expected.length && timingSafeEqual(received, expected)
}

export { deriveJobRunnerToken, isJobRunnerRequest }
