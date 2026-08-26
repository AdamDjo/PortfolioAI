import { describe, expect, it } from 'vitest'

import { getHomeContent } from '@/app/[lang]/(site)/(home)/_content'

import { getAssistantMessages } from './assistant-messages'
import { LOCALES } from './config'
import { getMessages } from './messages'

/**
 * The shape of each dictionary is already enforced by the type checker — every
 * locale is typed against the English one. What types cannot catch is a key left
 * holding the English string in a translated dictionary, or an empty value, so
 * that is what these tests look for.
 */

/** Every leaf string in a dictionary, keyed by its dotted path. */
function flatten(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value }

  const entries: [string, unknown][] = Array.isArray(value)
    ? value.map((item, index) => [`${prefix}[${index}]`, item])
    : value && typeof value === 'object'
      ? Object.entries(value).map(([key, child]) => [prefix ? `${prefix}.${key}` : key, child])
      : []

  const flat: Record<string, string> = {}
  for (const [key, child] of entries) Object.assign(flat, flatten(child, key))
  return flat
}

describe('UI messages', () => {
  it.each(LOCALES)('has no blank string for %s', (locale) => {
    for (const [key, value] of Object.entries(flatten(getMessages(locale)))) {
      expect(value.trim(), `${locale}: ${key} is blank`).not.toBe('')
    }
  })

  it('translates the navigation rather than repeating English', () => {
    expect(getMessages('fr').nav.home).not.toBe(getMessages('en').nav.home)
    expect(getMessages('fr').footer.legal).not.toBe(getMessages('en').footer.legal)
  })
})

describe('home content', () => {
  it.each(LOCALES)('has no blank string for %s', (locale) => {
    for (const [key, value] of Object.entries(flatten(getHomeContent(locale)))) {
      expect(value.trim(), `${locale}: ${key} is blank`).not.toBe('')
    }
  })

  // Product names stay identical across locales, so the check targets prose.
  it('translates the hero copy', () => {
    expect(getHomeContent('fr').hero.lead).not.toBe(getHomeContent('en').hero.lead)
    expect(getHomeContent('fr').chat.header).not.toBe(getHomeContent('en').chat.header)
  })

  it('keeps the rail ids stable so they pair with their destinations', () => {
    const ids = (locale: (typeof LOCALES)[number]) =>
      getHomeContent(locale).rail.map((item) => item.id)
    expect(ids('fr')).toEqual(ids('en'))
  })
})

describe('assistant messages', () => {
  it.each(LOCALES)('pins the reply language for %s', (locale) => {
    expect(getAssistantMessages(locale).languageInstruction.trim()).not.toBe('')
    expect(getAssistantMessages(locale).rateLimited.trim()).not.toBe('')
  })
})
