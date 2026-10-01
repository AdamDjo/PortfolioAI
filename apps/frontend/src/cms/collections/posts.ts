import { CONTENT_TAGS, revalidateCollection } from '@/lib/content-cache'
import { computeReadingTime, type RichTextValue } from '@/lib/reading-time'
import { toSlug } from '@/lib/slug'

import { withMarkdownImport } from '../markdown-import'

import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

const revalidate = revalidateCollection(CONTENT_TAGS.posts)

/**
 * Recomputes the reading time from the body that is about to be written.
 *
 * It runs as a collection hook rather than a field hook so its position in the
 * pipeline is explicit: it is registered *after* the Markdown import and
 * therefore measures the converted body, not the empty field the import filled.
 *
 * Localized like the body it measures — a translation is never the same length
 * as its source, and announcing the French duration on the English article would
 * be a visible lie.
 */
const withReadingTime: CollectionBeforeChangeHook = ({ data }) => ({
  ...data,
  readingTime: computeReadingTime(data.content as RichTextValue | null | undefined),
})

/**
 * Articles published at `/blog`.
 *
 * This is the collection the site's indexable surface grows from: everything
 * here exists to be read by a visitor and by a crawler, which is why the slug,
 * the excerpt and the publication date are first-class fields rather than
 * metadata bolted on afterwards.
 *
 * Drafts are enabled, so an article is written over several sessions and only
 * becomes public on an explicit publish. Unlike the other collections, public
 * read access is therefore a filter rather than a flat `true`: the API itself
 * refuses to serve an unpublished document, so no page or feed can leak one by
 * forgetting a `where` clause.
 */
const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Article', plural: 'Articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'publishedAt', 'updatedAt'],
    description:
      'Rédigez en Markdown dans votre éditeur, collez-le dans « Import Markdown », puis ajoutez les images dans le corps.',
  },
  versions: {
    // Drafts, and the version history that comes with them: an article is a
    // long-lived document, so being able to read back what changed matters as
    // much as the draft state itself.
    drafts: true,
  },
  access: {
    /*
     * A visitor only ever sees published articles. Returning a constraint rather
     * than `false` keeps the public API usable — the feed and the pages read
     * through it with `overrideAccess: false` — while making a draft
     * unreachable even by guessing its slug.
     */
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Identifiant (URL)',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          "Généré depuis le titre. Modifiable avant la première publication : le changer ensuite casse l'adresse déjà partagée.",
      },
      hooks: {
        /*
         * Deliberately *not* localized: one article has one address, and the
         * locale prefix already distinguishes `/en/blog/x` from `/fr/blog/x`.
         * A slug per language would double the URLs to be indexed for a single
         * piece of content.
         *
         * An existing slug is kept as it is, even when the title changes: the
         * address has been shared, indexed and linked by then, and search
         * engines treat a new URL as a new page with none of the old one's
         * history. Renaming stays possible, but only by hand.
         */
        beforeValidate: [
          ({ data, value }) => {
            const current = typeof value === 'string' ? value.trim() : ''
            if (current !== '') return toSlug(current)

            const title = typeof data?.title === 'string' ? data.title : ''
            return toSlug(title)
          },
        ],
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Résumé',
      localized: true,
      admin: {
        description:
          "Sert de méta-description et de résumé dans la liste. Laissez vide pour reprendre le début de l'article.",
      },
    },
    {
      name: 'markdownImport',
      type: 'textarea',
      label: 'Import Markdown',
      localized: true,
      admin: {
        description:
          'Collez ici le Markdown rédigé ailleurs : il remplace le corps à l’enregistrement, puis ce champ se vide. Les blocs de code arrivent en paragraphes — le texte et l’indentation sont conservés, la coloration non.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Corps',
      localized: true,
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Visuel de tête',
      admin: {
        description:
          "Affiché en tête de l'article. L'image de partage est générée depuis le titre, elle ne reprend pas ce visuel.",
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Tags',
      admin: {
        position: 'sidebar',
        description: 'Réutilise le vocabulaire de la veille.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Date de publication',
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        description: 'Date affichée et ordre de la liste.',
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      label: 'Durée de lecture (min)',
      localized: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Calculée à chaque enregistrement.',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      admin: {
        description: 'À remplir seulement pour sortir du titre et du résumé par défaut.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Titre de la balise',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Méta-description',
          localized: true,
        },
      ],
    },
  ],
  hooks: {
    // Order matters: the import fills `content`, the reading time measures it.
    beforeChange: [
      withMarkdownImport({ markdown: 'markdownImport', content: 'content' }),
      withReadingTime,
    ],
    afterChange: [revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
}

export { Posts }
