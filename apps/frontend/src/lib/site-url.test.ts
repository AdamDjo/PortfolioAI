import { describe, expect, it } from 'vitest'

import { SITE_URL, absoluteUrl } from './site-url'

describe('absoluteUrl', () => {
  it('joins a path to the origin', () => {
    expect(absoluteUrl('/en/blog')).toBe(`${SITE_URL}/en/blog`)
  })

  it('accepts a path without its leading slash', () => {
    expect(absoluteUrl('en/blog')).toBe(`${SITE_URL}/en/blog`)
  })

  /*
   * The bug this prevents: a configured origin ending in a slash would produce
   * `https://site//blog`, which search engines treat as a different address than
   * the one every link on the site points to.
   */
  it('never produces a double slash', () => {
    expect(absoluteUrl('/en/blog')).not.toContain('//en')
    expect(SITE_URL.endsWith('/')).toBe(false)
  })
})
