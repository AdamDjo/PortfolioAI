import { afterEach, describe, expect, it } from 'vitest'

import { checkRateLimit, resetRateLimit } from './rate-limit'

import type { RateLimitConfig } from './rate-limit'

/** Small, legible ceilings so a test can reach each one in a few calls. */
const CONFIG: RateLimitConfig = {
  burst: { windowMs: 1_000, max: 3 },
  window: { windowMs: 10_000, max: 6 },
  daily: { windowMs: 1_000_000, max: 10 },
}

const KEY = 'fingerprint-a'

afterEach(() => {
  resetRateLimit()
})

/** Sends `count` requests at `now`, returning the last verdict. */
const spend = (count: number, now: number) => {
  let last = checkRateLimit(KEY, CONFIG, now)
  for (let i = 1; i < count; i += 1) last = checkRateLimit(KEY, CONFIG, now)
  return last
}

describe('checkRateLimit', () => {
  it('laisse passer une conversation normale', () => {
    // Three questions spread over half a minute stay under every ceiling.
    expect(checkRateLimit(KEY, CONFIG, 0).allowed).toBe(true)
    expect(checkRateLimit(KEY, CONFIG, 15_000).allowed).toBe(true)
    expect(checkRateLimit(KEY, CONFIG, 30_000).allowed).toBe(true)
  })

  it('rejette une rafale au-delà du seuil de burst', () => {
    expect(spend(3, 0).allowed).toBe(true)
    const fourth = checkRateLimit(KEY, CONFIG, 0)

    expect(fourth).toEqual({ allowed: false, reason: 'burst' })
  })

  it('laisse repartir le burst une fois sa fenêtre passée', () => {
    spend(3, 0)
    expect(checkRateLimit(KEY, CONFIG, 0).allowed).toBe(false)

    // 1.1s later the burst window has slid past the first three.
    expect(checkRateLimit(KEY, CONFIG, 1_100).allowed).toBe(true)
  })

  it('rejette au seuil de la fenêtre, sans déclencher le burst', () => {
    // Spaced just past the burst window so burst never trips; all still inside
    // the 10s window. The sixth fills it, the seventh is refused on 'window'.
    let last = checkRateLimit(KEY, CONFIG, 0)
    for (let i = 1; i < CONFIG.window.max; i += 1) {
      last = checkRateLimit(KEY, CONFIG, i * 1_100)
    }
    expect(last.allowed).toBe(true)

    expect(checkRateLimit(KEY, CONFIG, CONFIG.window.max * 1_100)).toEqual({
      allowed: false,
      reason: 'window',
    })
  })

  it('applique le plafond quotidien, sans déclencher les tiers plus courts', () => {
    // Spaced past the window (10s) so only the daily cap accumulates.
    const step = CONFIG.window.windowMs + 1_000
    let last = checkRateLimit(KEY, CONFIG, 0)
    for (let i = 1; i < CONFIG.daily.max; i += 1) {
      last = checkRateLimit(KEY, CONFIG, i * step)
    }
    expect(last.allowed).toBe(true)

    expect(checkRateLimit(KEY, CONFIG, CONFIG.daily.max * step)).toEqual({
      allowed: false,
      reason: 'daily',
    })
  })

  it('ne compte pas une requête refusée, pour ne pas allonger le blocage', () => {
    spend(3, 0)
    // Two refusals while blocked…
    checkRateLimit(KEY, CONFIG, 200)
    checkRateLimit(KEY, CONFIG, 400)

    // …must not delay recovery: the window still clears 1s after the last allowed hit.
    expect(checkRateLimit(KEY, CONFIG, 1_100).allowed).toBe(true)
  })

  it('sépare les appelants : l’un bloqué n’affecte pas l’autre', () => {
    spend(3, 0)
    expect(checkRateLimit(KEY, CONFIG, 0).allowed).toBe(false)

    expect(checkRateLimit('fingerprint-b', CONFIG, 0).allowed).toBe(true)
  })
})
