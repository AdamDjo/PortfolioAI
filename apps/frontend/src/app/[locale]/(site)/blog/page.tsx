import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'

import { JsonLd } from '@/components/json-ld'
import { buildAlternates } from '@/i18n/metadata'
import { getPathname } from '@/i18n/navigation'
import { getPageLocale } from '@/i18n/params'
import { listPublishedPosts } from '@/lib/posts'
import { absoluteUrl } from '@/lib/site-url'

import { PostList } from './_components/post-list'

import type { PostCardView } from './_components/post-list'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  const locale = await getPageLocale(params)
  const t = await getTranslations({ locale, namespace: 'Blog' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      ...buildAlternates(locale, '/blog'),
      // Declares the feed to readers and to anything subscribing to the blog
      // without visiting it.
      types: { 'application/rss+xml': getPathname({ href: '/blog/rss.xml', locale }) },
    },
    openGraph: { title: t('metaTitle'), description: t('metaDescription'), type: 'website' },
  }
}

async function BlogPage({ params }: PageProps<'/[locale]/blog'>) {
  const locale = await getPageLocale(params)
  setRequestLocale(locale)

  const [t, format, posts] = await Promise.all([
    getTranslations('Blog'),
    getFormatter({ locale }),
    listPublishedPosts(locale),
  ])

  /*
   * Dates and durations are formatted here rather than in the client component
   * that renders them: a date formatted on both sides of the boundary has to
   * agree on a time zone, and the mismatch surfaces as a hydration error on the
   * one day the server and the visitor disagree.
   */
  const cards: PostCardView[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverUrl: post.coverUrl,
    coverAlt: post.coverAlt,
    tags: post.tags,
    dateLabel: post.publishedAt
      ? format.dateTime(new Date(post.publishedAt), { dateStyle: 'long' })
      : null,
    readingLabel: post.readingTime ? t('readingTime', { count: post.readingTime }) : null,
  }))

  return (
    <div className="page shell">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          '@id': absoluteUrl(getPathname({ href: '/blog', locale })),
          name: t('metaTitle'),
          description: t('metaDescription'),
          inLanguage: locale,
        }}
      />
      <header className="page-heading">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1>{t('title')}</h1>
        <p>{t('lead')}</p>
      </header>
      <PostList posts={cards} />
    </div>
  )
}

export { BlogPage as default }
