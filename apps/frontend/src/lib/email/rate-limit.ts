/**
 * In-memory submission throttle.
 *
 * Deliberately not backed by Redis or Postgres: the portfolio runs a handful of
 * instances at most, and a limiter that occasionally forgets a caller after a
 * cold start is still the difference between a bot sending one message and a bot
 * sending a thousand. Adding a datastore for this would cost more than it saves.
 *
 * The consequence is worth stating plainly — this bounds abuse, it does not
 * block a determined attacker rotating IPs. Lumail's own quota is the real
 * ceiling, and the honeypot catches the naive bots.
 */

/** One message per window is plenty: a human writing twice can wait a minute. */
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 2

/**
 * Timestamps of recent hits, keyed by caller.
 *
 * A plain `Map` grows unbounded, so expired keys are swept on write. The sweep
 * is O(n) over the map, which stays small precisely because entries expire.
 */
const hits = new Map<string, number[]>()

const sweep = (now: number): void => {
  for (const [key, timestamps] of hits) {
    const fresh = timestamps.filter((at) => now - at < WINDOW_MS)
    if (fresh.length === 0) hits.delete(key)
    else hits.set(key, fresh)
  }
}

/**
 * Records an attempt and reports whether it is allowed.
 *
 * Returns `false` once the caller has spent its window, so the caller decides
 * what the visitor sees.
 */
const allowSubmission = (key: string, now: number = Date.now()): boolean => {
  sweep(now)

  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) return false

  hits.set(key, [...recent, now])
  return true
}

export { allowSubmission, MAX_PER_WINDOW, WINDOW_MS }
