'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Link } from '@/i18n/navigation'

/**
 * Sentinel for the unfiltered state, kept out of the tag namespace so it cannot
 * collide with a real tag. A stable value rather than the translated label, so
 * the filter does not change meaning when the visitor switches language. Same
 * reasoning as the veille grid, which solves the same problem.
 */
const ALL_TAGS = '\u0000all'

/** An article as the card renders it: every label already formatted server-side. */
interface PostCardView {
  slug: string
  title: string
  excerpt: string | null
  coverUrl: string | null
  coverAlt: string | null
  tags: string[]
  dateLabel: string | null
  readingLabel: string | null
}

/**
 * The article list and its tag filter.
 *
 * The articles arrive already rendered by the server, so the HTML a crawler
 * receives holds every published article whatever the filter does afterwards.
 * This component only decides what stays visible.
 */
function PostList({ posts }: { posts: PostCardView[] }) {
  const locale = useLocale()
  const t = useTranslations('Blog')
  const [activeTag, setActiveTag] = useState<string>(ALL_TAGS)

  // Only tags actually carried by an article: a filter that returns nothing has
  // no reason to exist.
  const tags = useMemo(() => {
    const all = new Set<string>()
    for (const post of posts) for (const tag of post.tags) all.add(tag)
    return [ALL_TAGS, ...[...all].sort((a, b) => a.localeCompare(b, locale))]
  }, [posts, locale])

  const visiblePosts = useMemo(
    () => (activeTag === ALL_TAGS ? posts : posts.filter((post) => post.tags.includes(activeTag))),
    [posts, activeTag]
  )

  if (posts.length === 0) {
    return <p className="blog-empty">{t('emptyState')}</p>
  }

  return (
    <>
      {tags.length > 1 ? (
        <div className="blog-filters" role="group" aria-label={t('filterAriaLabel')}>
          {tags.map((tag) => (
            <button
              aria-pressed={tag === activeTag}
              className={tag === activeTag ? 'is-active' : undefined}
              key={tag}
              onClick={() => setActiveTag(tag)}
              type="button"
            >
              {tag === ALL_TAGS ? t('allTag') : tag}
            </button>
          ))}
        </div>
      ) : null}

      {visiblePosts.length === 0 ? (
        <p className="blog-empty">{t('emptyFilteredState')}</p>
      ) : (
        <ul className="blog-list">
          {visiblePosts.map((post) => (
            <li key={post.slug}>
              <article className="blog-card">
                <Link className="blog-card-link" href={`/blog/${post.slug}`}>
                  {post.coverUrl ? (
                    <Image
                      alt={post.coverAlt ?? ''}
                      className="blog-card-cover"
                      height={180}
                      // Covers are uploaded to Payload and served from its media
                      // route, which already returns the stored file: running
                      // them through the optimizer would re-encode an image
                      // nobody asked to resize.
                      unoptimized
                      src={post.coverUrl}
                      width={320}
                    />
                  ) : null}
                  <div className="blog-card-body">
                    <p className="blog-card-meta">
                      {[post.dateLabel, post.readingLabel].filter(Boolean).join(' · ')}
                    </p>
                    <h2>{post.title}</h2>
                    {post.excerpt ? <p className="blog-card-excerpt">{post.excerpt}</p> : null}
                    {post.tags.length > 0 ? (
                      <p className="blog-card-tags">{post.tags.join(' · ')}</p>
                    ) : null}
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export { PostList, type PostCardView }
