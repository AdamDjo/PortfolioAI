import { describe, expect, it } from 'vitest'

import { serializeJsonLd } from './json-ld'

describe('serializeJsonLd', () => {
  it('produces parseable JSON', () => {
    const data = { '@type': 'BlogPosting', headline: 'Server Components' }

    expect(JSON.parse(serializeJsonLd(data))).toEqual(data)
  })

  /*
   * The injection this exists to stop: an article title holding `</script>`
   * would close the element early, and everything after it would be parsed as
   * markup. The titles come from the CMS, so the escaping belongs here rather
   * than in a validation rule nobody can enforce on prose.
   */
  it('cannot close the script element it sits in', () => {
    const serialized = serializeJsonLd({ headline: '</script><img src=x onerror=alert(1)>' })

    expect(serialized).not.toContain('</script>')
    expect(serialized).not.toContain('<img')
    expect(serialized).toContain('\\u003c')
  })

  it('keeps the escaped value readable once parsed', () => {
    const headline = 'a < b and c </script>'

    expect(JSON.parse(serializeJsonLd({ headline })) as { headline: string }).toEqual({ headline })
  })
})
