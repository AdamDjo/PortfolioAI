/**
 * In-memory rate limiter for the public assistant.
 *
 * The chat concatenates a question into a prompt billed by the token and calls
 * an external provider on every turn, so an unthrottled endpoint is a way to
 * drain a quota or run up a bill from a shell loop. This bounds that.
 *
 * Three ceilings, checked together, each catching a different shape of abuse:
 *   - burst  — a handful of requests in a few seconds, the scripted loop
 *   - window — a steady stream over a minute, the patient scraper
 *   - daily  — the total one caller may spend in a day
 *
 * Counters live in a module-level `Map`, deliberately not in Redis or Postgres:
 * the site runs a handful of instances at most, and a limiter that forgets a
 * caller after a redeploy still turns "a thousand requests" into "a few". The
 * cost of a datastore would exceed what it buys today. The trade-off is explicit
 * and the limiter sits behind a narrow interface, so swapping in a shared store
 * later is a one-file change. The provider's own quota remains the real ceiling.
 */

/** One tier of the limit: at most `max` hits within `windowMs`. */
interface Tier {
  windowMs: number
  max: number
}

interface RateLimitConfig {
  burst: Tier
  window: Tier
  daily: Tier
}

/** Why a caller was refused, so the route can log which ceiling bit. */
type RateLimitReason = 'burst' | 'window' | 'daily'

type RateLimitResult = { allowed: true } | { allowed: false; reason: RateLimitReason }

/**
 * Default ceilings, sized for a real conversation.
 *
 * A person asking follow-up questions sends a message every few seconds at most
 * and a few dozen in a sitting; these bounds sit well above that and well below
 * what a script would want. They are the decision, reviewable here rather than
 * inherited from anywhere.
 */
const DEFAULT_CONFIG: RateLimitConfig = {
  burst: { windowMs: 10_000, max: 5 },
  window: { windowMs: 60_000, max: 15 },
  daily: { windowMs: 24 * 60 * 60_000, max: 200 },
}

/**
 * Recent hit timestamps per caller, newest last.
 *
 * A plain `Map` would grow without bound, so each entry is pruned to the longest
 * window on every touch and dropped once empty. The map therefore stays as small
 * as the set of callers active within a day.
 */
const hits = new Map<string, number[]>()

/** Count of timestamps within `windowMs` of `now`. */
const countWithin = (timestamps: number[], windowMs: number, now: number): number =>
  timestamps.reduce((total, at) => (now - at < windowMs ? total + 1 : total), 0)

/**
 * Records a hit for the caller and reports whether it is allowed.
 *
 * The hit is recorded only when allowed: a refused request must not push the
 * caller further past the limit, which would extend their lockout every time
 * they retry. Order matters — burst first, then window, then daily — so the log
 * names the tightest ceiling the caller actually crossed.
 */
const checkRateLimit = (
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
  now: number = Date.now()
): RateLimitResult => {
  const longestWindow = Math.max(
    config.burst.windowMs,
    config.window.windowMs,
    config.daily.windowMs
  )

  const timestamps = (hits.get(key) ?? []).filter((at) => now - at < longestWindow)

  for (const [reason, tier] of [
    ['burst', config.burst],
    ['window', config.window],
    ['daily', config.daily],
  ] as const) {
    if (countWithin(timestamps, tier.windowMs, now) >= tier.max) {
      // Keep the pruned list so the entry does not regrow with stale timestamps.
      hits.set(key, timestamps)
      return { allowed: false, reason }
    }
  }

  timestamps.push(now)
  hits.set(key, timestamps)
  return { allowed: true }
}

/** Clears all recorded hits. Test-only; production state lives for the process. */
const resetRateLimit = (): void => {
  hits.clear()
}

export { checkRateLimit, resetRateLimit, DEFAULT_CONFIG }
export type { RateLimitConfig, RateLimitReason, RateLimitResult }
