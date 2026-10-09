import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

import { getPreviewUser, parsePreviewTarget } from '@/lib/preview'

import type { NextRequest } from 'next/server'

/**
 * Opens the preview of an article: turns draft mode on, then sends the browser
 * to the article page, which reads the latest saved version instead of the
 * published one. The "Preview" button of a post in `/admin` points here.
 *
 * Anyone who is not the signed-in admin gets the same bare 404 as a malformed
 * request — the route does not confirm that it exists, let alone the article.
 */
export async function GET(request: NextRequest) {
  const target = parsePreviewTarget(request.nextUrl.searchParams)
  const user = target ? await getPreviewUser() : null
  if (!target || !user) return new NextResponse(null, { status: 404 })

  const draft = await draftMode()
  draft.enable()

  return NextResponse.redirect(new URL(`/${target.locale}/blog/${target.slug}`, request.url), {
    headers: { 'Cache-Control': 'no-store' },
  })
}
