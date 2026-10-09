import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { z } from 'zod'

import { routing } from '@/i18n/routing'
import config from '@payload-config'

import type { PreviewUser } from '@/lib/posts'

/**
 * Draft preview of blog articles (#89).
 *
 * Two independent locks guard a draft. The preview route only turns Next's draft
 * mode on for a signed-in admin, and the article page only reads drafts when the
 * request carries both the draft-mode cookie *and* a valid Payload session. A
 * leaked preview link or a copied draft-mode cookie therefore shows nothing on
 * its own: without the session the page reads published content, as for anyone.
 */

/** Same shape `toSlug` produces: lowercase words joined by single hyphens. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Query string of the preview routes.
 *
 * Both values end up in a redirect `Location`, so they are validated against
 * closed shapes rather than encoded: a locale from the routing table and a slug
 * that cannot contain `/`, `.` or a scheme, which rules out an open redirect.
 */
const previewTargetSchema = z.object({
  locale: z.enum(routing.locales),
  slug: z.string().max(200).regex(SLUG_PATTERN),
})

type PreviewTarget = z.infer<typeof previewTargetSchema>

const parsePreviewTarget = (params: URLSearchParams): PreviewTarget | null => {
  const result = previewTargetSchema.safeParse({
    locale: params.get('locale'),
    slug: params.get('slug'),
  })
  return result.success ? result.data : null
}

/** The admin signed in on this request, or `null` for everyone else. */
const getPreviewUser = async (): Promise<PreviewUser | null> => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return user ?? null
}

export { getPreviewUser, parsePreviewTarget, type PreviewTarget }
