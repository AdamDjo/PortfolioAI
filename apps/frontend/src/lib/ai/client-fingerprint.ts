import { createHash } from 'node:crypto'

/**
 * Turns a request into an anonymous, per-day caller fingerprint.
 *
 * The rate limiter needs to tell callers apart without ever learning who they
 * are. A bare hash of an IPv4 address is not anonymous — the whole 32-bit space
 * hashes in minutes, so the digest is trivially reversible. Two things prevent
 * that here: a secret salt held only in the environment, and the UTC date folded
 * into the salt so the same address yields a different fingerprint every day and
 * cannot be followed across them.
 *
 * The raw address is never returned, logged or stored. Only the digest leaves
 * this module.
 */

/**
 * Reads the caller's address from the proxy header.
 *
 * `x-forwarded-for` is set by the reverse proxy in front of the app and lists
 * the chain client, proxy, …; the first entry is the original caller. It is
 * spoofable when the app is reached directly, which is why the deployment must
 * put the app behind a proxy that overwrites this header — see issue #10. Until
 * then an unidentified caller shares the `unknown` bucket rather than escaping
 * the limit.
 */
const readClientAddress = (headers: Headers): string => {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded

  // Some proxies use this instead; kept as a fallback, never trusted alone.
  const real = headers.get('x-real-ip')?.trim()
  return real && real !== '' ? real : 'unknown'
}

/** The salt in effect today: the secret combined with the UTC date. */
const dailySalt = (secret: string, now: number): string => {
  const day = new Date(now).toISOString().slice(0, 10) // YYYY-MM-DD, UTC.
  return `${secret}:${day}`
}

/**
 * Computes the fingerprint, or `null` when no secret is configured.
 *
 * `null` is a deployment state, not a bug: without a salt the digest would be
 * reversible, so the caller treats an unconfigured fingerprint as "cannot
 * anonymise, therefore do not limit" rather than storing something weaker. The
 * limiter degrades to off, exactly as the assistant degrades to its fallback
 * without an API key.
 */
const computeFingerprint = (
  headers: Headers,
  env: NodeJS.ProcessEnv = process.env,
  now: number = Date.now()
): string | null => {
  const secret = env.CHAT_FINGERPRINT_SALT?.trim()
  if (!secret) return null

  const address = readClientAddress(headers)

  return createHash('sha256')
    .update(`${dailySalt(secret, now)}:${address}`)
    .digest('hex')
}

export { computeFingerprint }
