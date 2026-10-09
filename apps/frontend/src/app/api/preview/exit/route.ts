import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

import { routing } from '@/i18n/routing'

import type { NextRequest } from 'next/server'

/**
 * Leaves the preview: clears the draft-mode cookie and returns to the blog index.
 *
 * The index rather than the article, because the article may well be a draft —
 * once draft mode is off it is a 404 again. No session is required: turning
 * draft mode *off* can only ever reduce what the visitor sees.
 */
export async function GET(request: NextRequest) {
  const draft = await draftMode()
  draft.disable()

  const requested = request.nextUrl.searchParams.get('locale')
  const locale = routing.locales.find((candidate) => candidate === requested)

  return NextResponse.redirect(new URL(`/${locale ?? routing.defaultLocale}/blog`, request.url), {
    headers: { 'Cache-Control': 'no-store' },
  })
}
