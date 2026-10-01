import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import { getPayload } from 'payload'

import { CONTENT_TAGS, cachedRead } from '@/lib/content-cache'
import config from '@payload-config'

import type { Locale } from '@/i18n/routing'
import type { RichTextValue } from '@/lib/reading-time'
import type { Post } from '@/payload-types'

/**
 * Server-side access to the blog articles.
 *
 * Payload is queried locally through `getPayload`, like the other content reads:
 * the pages are server components rendered in this same process.
 *
 * Drafts never need filtering here. `posts` grants the public a constrained read
 * (`_status: published`) and every call below runs with `overrideAccess: false`,
 * so an unpublished article is unreachable even if a `where` clause were
 * forgotten. That is deliberate: the guarantee lives in the collection, not in
 * each caller.
 */

/** Longest meta description worth writing: Google truncates around this width. */
const DESCRIPTION_LIMIT = 160

const asText = (value: string | null | undefined): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * The fields the list query asks for.
 *
 * Derived from `Post` rather than written out: the list uses `select`, so Payload
 * returns exactly these keys and a mapper typed on the whole document would not
 * accept them. Spelling the shape out by hand would also drift the day a field is
 * renamed in the collection.
 */
type PostListFields = Pick<
  Post,
  | 'id'
  | 'title'
  | 'slug'
  | 'excerpt'
  | 'cover'
  | 'tags'
  | 'publishedAt'
  | 'updatedAt'
  | 'readingTime'
>

/** What the index, the feed and the sitemap all need. */
interface PostSummary {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverUrl: string | null
  coverAlt: string | null
  tags: string[]
  /** ISO string, or null while an article carries no date. */
  publishedAt: string | null
  updatedAt: string
  readingTime: number | null
}

/** One entry of the RSS feed, already reduced to what the serializer writes. */
interface FeedEntry {
  slug: string
  title: string
  description: string | null
  published: string | null
}

/** Adds what only the article page renders. */
interface PostDetail extends PostSummary {
  content: RichTextValue | null
  seoTitle: string | null
  seoDescription: string | null
}

/**
 * Tag names from a Payload relation.
 *
 * Depth is 1 on every read here, so the relation holds documents; bare
 * identifiers are ignored rather than fetched one by one.
 */
const readTags = (relation: Post['tags']): string[] => {
  if (!relation) return []

  const names: string[] = []
  for (const entry of relation) {
    if (typeof entry === 'number') continue
    const name = asText(entry.name)
    if (name) names.push(name)
  }
  return names
}

/**
 * The cover's URL and alt text, or nulls when none is attached.
 *
 * A bare number means the relation was not populated, which cannot happen at the
 * depth these reads use; it is handled rather than asserted away, because a
 * missing visual is not worth throwing over.
 */
const readCover = (cover: Post['cover']): { url: string | null; alt: string | null } => {
  if (!cover || typeof cover === 'number') return { url: null, alt: null }

  return { url: asText(cover.url), alt: asText(cover.alt) }
}

/**
 * The text that describes an article to a search engine or a feed reader.
 *
 * The excerpt wins when it exists. Without one, the opening of the body stands
 * in: an article with no description at all is worse than one described by its
 * own first sentences. The cut lands on a word boundary, because a description
 * ending mid-word reads as broken rather than as truncated.
 */
const resolveDescription = (
  excerpt: string | null,
  content: RichTextValue | null | undefined
): string | null => {
  if (excerpt) return excerpt
  if (!content) return null

  const plain = convertLexicalToPlaintext({ data: content }).replace(/\s+/g, ' ').trim()
  if (plain === '') return null
  if (plain.length <= DESCRIPTION_LIMIT) return plain

  const cut = plain.slice(0, DESCRIPTION_LIMIT)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.]$/, '')}…`
}

const toSummary = (doc: PostListFields): PostSummary => {
  const cover = readCover(doc.cover)

  return {
    id: String(doc.id),
    slug: doc.slug ?? String(doc.id),
    title: asText(doc.title) ?? '',
    excerpt: asText(doc.excerpt),
    coverUrl: cover.url,
    coverAlt: cover.alt,
    tags: readTags(doc.tags),
    publishedAt: asText(doc.publishedAt),
    updatedAt: doc.updatedAt,
    readingTime: typeof doc.readingTime === 'number' ? doc.readingTime : null,
  }
}

const toDetail = (doc: Post): PostDetail => ({
  ...toSummary(doc),
  content: (doc.content as RichTextValue | null | undefined) ?? null,
  seoTitle: asText(doc.seo?.title),
  seoDescription: asText(doc.seo?.description),
})

/**
 * Published articles, newest first.
 *
 * Sorted on `publishedAt` rather than on `createdAt`: an article written over
 * two weeks must appear at the date it was published, not the date it was
 * started.
 *
 * The body is left out. This list feeds the index, the feed and the sitemap, and
 * carrying every article's full rich text in one cache entry would grow without
 * bound for text nothing on those surfaces renders.
 */
const readPublishedPosts = async (locale: Locale): Promise<PostSummary[]> => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    locale,
    sort: '-publishedAt',
    limit: 500,
    depth: 1,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      cover: true,
      tags: true,
      publishedAt: true,
      updatedAt: true,
      readingTime: true,
    },
    overrideAccess: false,
  })

  return result.docs.map(toSummary)
}

const listPublishedPosts = cachedRead(CONTENT_TAGS.posts, 'posts:list', readPublishedPosts)

/**
 * The feed's entries, newest first.
 *
 * A read of its own rather than the list above, because the feed is the one
 * surface that needs the body: an article with no excerpt still has to carry a
 * description, which is exactly what the field promises in the admin. Loading
 * every body into the list's cache entry to serve a surface that renders no
 * article in full would be the wrong trade in the other direction.
 */
const readFeedEntries = async (locale: Locale): Promise<FeedEntry[]> => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    locale,
    sort: '-publishedAt',
    limit: 50,
    // No relation is read, so the documents come back flat.
    depth: 0,
    select: { slug: true, title: true, excerpt: true, content: true, publishedAt: true },
    overrideAccess: false,
  })

  return result.docs.map((doc) => ({
    slug: doc.slug ?? String(doc.id),
    title: asText(doc.title) ?? '',
    description: resolveDescription(
      asText(doc.excerpt),
      (doc.content as RichTextValue | null | undefined) ?? null
    ),
    published: asText(doc.publishedAt),
  }))
}

const listFeedEntries = cachedRead(CONTENT_TAGS.posts, 'posts:feed', readFeedEntries)

/**
 * One published article, or `null` when the slug matches nothing public.
 *
 * Deliberately *not* wrapped in `cachedRead`: the caching helper keys entries by
 * locale alone, and an entry per slug would have to be built by hand on every
 * call — which would defeat the cache it creates. It is not needed either. The
 * article pages are prerendered and regenerated by `revalidatePath` when a post
 * changes, so this query runs at build time and once per publish, not per
 * visitor.
 */
const readPublishedPost = async (locale: Locale, slug: string): Promise<PostDetail | null> => {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })

  const doc = result.docs[0]
  return doc ? toDetail(doc) : null
}

export {
  DESCRIPTION_LIMIT,
  listFeedEntries,
  listPublishedPosts,
  readPublishedPost,
  resolveDescription,
  type FeedEntry,
  type PostDetail,
  type PostSummary,
}
