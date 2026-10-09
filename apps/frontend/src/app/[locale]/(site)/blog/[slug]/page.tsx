import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'

import { JsonLd } from '@/components/json-ld'
import { buildAlternates } from '@/i18n/metadata'
import { getPathname, Link } from '@/i18n/navigation'
import { getPageLocale } from '@/i18n/params'
import { routing } from '@/i18n/routing'
import { listPublishedPosts, readPublishedPost, resolveDescription } from '@/lib/posts'
import { absoluteUrl } from '@/lib/site-url'

import type { Metadata } from 'next'

/**
 * Renders the code block Payload's premade `CodeBlock` produces.
 *
 * The default converters know nothing about a block's shape — a block is the
 * project's own data — so without this one a fenced snippet would render as an
 * empty node. The language lands on the element as the `language-*` class every
 * highlighter expects, so adding one later needs no change here.
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    Code: ({ node }: { node: { fields: { code?: string; language?: string } } }) => {
      const { code, language } = node.fields
      if (!code) return null

      return (
        <pre>
          <code className={language ? `language-${language}` : undefined}>{code}</code>
        </pre>
      )
    },
  },
})

/**
 * Prerenders one page per published article, per language.
 *
 * Only the slugs are produced here: the locale segment is enumerated by the
 * layout above, which already declares every supported language.
 */
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!hasLocale(routing.locales, params.locale)) return []

  const posts = await listPublishedPosts(params.locale)
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const locale = await getPageLocale(params)
  const post = await readPublishedPost(locale, slug)

  // A slug that matches nothing renders the 404 below; metadata for a page that
  // does not exist would only describe the error.
  if (!post) return {}

  const title = post.seoTitle ?? post.title
  const description = post.seoDescription ?? resolveDescription(post.excerpt, post.content)

  return {
    title,
    description: description ?? undefined,
    alternates: buildAlternates(locale, `/blog/${slug}`),
    openGraph: {
      title,
      description: description ?? undefined,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
    },
    twitter: { card: 'summary_large_image', title, description: description ?? undefined },
  }
}

async function ArticlePage({ params }: PageProps<'/[locale]/blog/[slug]'>) {
  const { slug } = await params
  const locale = await getPageLocale(params)
  setRequestLocale(locale)

  const [t, format, post] = await Promise.all([
    getTranslations('Blog'),
    getFormatter({ locale }),
    readPublishedPost(locale, slug),
  ])

  // Covers both an unknown slug and a draft: the collection refuses to serve an
  // unpublished document, so a draft is indistinguishable from a typo here. That
  // is the intended behaviour — a draft must not even confirm that it exists.
  if (!post) notFound()

  const url = absoluteUrl(getPathname({ href: `/blog/${slug}`, locale }))
  const description = post.seoDescription ?? resolveDescription(post.excerpt, post.content)
  const dateLabel = post.publishedAt
    ? format.dateTime(new Date(post.publishedAt), { dateStyle: 'long' })
    : null

  return (
    <div className="page shell">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          '@id': url,
          headline: post.title,
          description: description ?? undefined,
          datePublished: post.publishedAt ?? undefined,
          dateModified: post.updatedAt,
          inLanguage: locale,
          keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
          image: post.coverUrl ? absoluteUrl(post.coverUrl) : undefined,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: t('breadcrumbHome'),
              item: absoluteUrl(getPathname({ href: '/', locale })),
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: t('metaTitle'),
              item: absoluteUrl(getPathname({ href: '/blog', locale })),
            },
            { '@type': 'ListItem', position: 3, name: post.title },
          ],
        }}
      />

      <article className="article">
        <header className="article-head">
          <p className="eyebrow">
            {[dateLabel, post.readingTime ? t('readingTime', { count: post.readingTime }) : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <h1>{post.title}</h1>
          {post.excerpt ? <p className="article-lead">{post.excerpt}</p> : null}
          {post.tags.length > 0 ? <p className="article-tags">{post.tags.join(' · ')}</p> : null}
        </header>

        {post.coverUrl ? (
          <Image
            alt={post.coverAlt ?? ''}
            className="article-cover"
            height={630}
            priority
            // `priority` alone only preloads in Next 16; the cover is the LCP image.
            fetchPriority="high"
            // Served straight from Payload's media route, as on the index.
            unoptimized
            src={post.coverUrl}
            width={1200}
          />
        ) : null}

        {post.content ? (
          <div className="article-body">
            <RichText converters={converters} data={post.content} />
          </div>
        ) : null}
      </article>

      <Link className="article-back" href="/blog">
        <ArrowLeft size={16} /> {t('backToIndex')}
      </Link>
    </div>
  )
}

export { ArticlePage as default }
