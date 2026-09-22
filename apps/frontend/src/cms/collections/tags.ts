import { CONTENT_TAGS, revalidateCollection } from '@/lib/content-cache'
import { toTagSlug } from '@/lib/tag-slug'

import type { CollectionConfig } from 'payload'

// Tag names are resolved in the bookmark view: renaming one changes what is
// displayed without touching the `bookmarks` documents.
const revalidate = revalidateCollection(CONTENT_TAGS.bookmarks)

/**
 * Tags used to classify veille links.
 *
 * A collection of their own rather than a free-text field: that is what lets a
 * tag be renamed once and change everywhere, and what keeps near-duplicates
 * ("React" / "react" / "ReactJS") from piling up — the unique `slug` is what
 * enforces it, since all three collapse to the same identifier.
 *
 * Creation is also offered on `/veille` to the signed-in owner, which is why the
 * slug rule is shared (see lib/tag-slug): the page resolves a typed name against
 * the existing vocabulary before posting, so a near-duplicate selects the tag
 * that already exists instead of failing on the unique index.
 */
const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  access: {
    // The public site reads tags to offer the filters; only the admin edits them.
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nom',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Identifiant',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Généré depuis le nom, utilisé dans les URL de filtre.',
      },
      hooks: {
        beforeValidate: [({ data }) => toTagSlug(typeof data?.name === 'string' ? data.name : '')],
      },
    },
  ],
  hooks: {
    afterChange: [revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
}

export { Tags }
