import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as Preview from '@/lib/preview'

const enable = vi.fn()
const getPreviewUser = vi.fn<() => Promise<{ id: number; email: string } | null>>()

vi.mock('next/headers', () => ({ draftMode: () => Promise.resolve({ enable }) }))
// `redirect()` throws to end the handler; the stub throws the target so the test can read it.
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`)
  },
}))
vi.mock('@/lib/preview', async (importOriginal) => ({
  ...(await importOriginal<typeof Preview>()),
  getPreviewUser: () => getPreviewUser(),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))

const { GET } = await import('./route')

const request = (query: string) => new NextRequest(`http://localhost:3000/api/preview?${query}`)

describe('GET /api/preview', () => {
  beforeEach(() => {
    enable.mockClear()
    getPreviewUser.mockReset()
  })

  it('answers 404 to a visitor, without enabling draft mode', async () => {
    getPreviewUser.mockResolvedValue(null)

    const response = await GET(request('locale=fr&slug=article'))

    expect(response.status).toBe(404)
    expect(enable).not.toHaveBeenCalled()
  })

  it('answers 404 to a malformed request before checking the session', async () => {
    const response = await GET(request('locale=fr&slug=//evil.example'))

    expect(response.status).toBe(404)
    expect(getPreviewUser).not.toHaveBeenCalled()
    expect(enable).not.toHaveBeenCalled()
  })

  it('enables draft mode for the admin and redirects to the article', async () => {
    getPreviewUser.mockResolvedValue({ id: 1, email: 'admin@example.com' })

    // A relative path: an absolute URL built from the request would name the
    // address the server listens on, not the public domain behind the proxy.
    await expect(GET(request('locale=en&slug=server-components-101'))).rejects.toThrow(
      'redirect:/en/blog/server-components-101'
    )
    expect(enable).toHaveBeenCalledOnce()
  })
})
