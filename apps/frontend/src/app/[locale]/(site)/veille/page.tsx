import { headers } from 'next/headers'
import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'

import { buildAlternates } from '@/i18n/metadata'
import { getPageLocale } from '@/i18n/params'
import { listPublicBookmarks } from '@/lib/bookmarks'
import { listAllTags } from '@/lib/tags'
import config from '@payload-config'

import { BookmarkComposer } from './_components/bookmark-composer'
import { BookmarkGrid } from './_components/bookmark-grid'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/veille'>): Promise<Metadata> {
  const locale = await getPageLocale(params)
  const t = await getTranslations({ locale, namespace: 'Veille' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: buildAlternates(locale, '/veille'),
  }
}

/**
 * The list changes as soon as a link is added: render on demand rather than
 * freezing the page at build time.
 */
export const dynamic = 'force-dynamic'

/** True only when the request carries a valid Payload session. */
async function isOwner(): Promise<boolean> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return Boolean(user)
}

async function WatchPage() {
  // Rendered on demand, so the locale comes from the request rather than params.
  const locale = await getLocale()

  // Reading is public and the session only decides whether the editing controls
  // are rendered: the queries are independent.
  const [t, bookmarks, owner, allTags] = await Promise.all([
    getTranslations('Veille'),
    listPublicBookmarks(locale),
    isOwner(),
    listAllTags(locale),
  ])

  return (
    <div className="page shell">
      <header className="page-heading">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1>{t('title')}</h1>
        <p>{t('lead')}</p>
      </header>
      {owner ? <BookmarkComposer tags={allTags} /> : null}
      <BookmarkGrid bookmarks={bookmarks} allTags={allTags} canEdit={owner} />
    </div>
  )
}

export { WatchPage as default }
