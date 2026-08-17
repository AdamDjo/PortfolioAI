import { CONTENT_TAGS, revalidateCollection } from '../lib/content-cache'

import type { CollectionConfig } from 'payload'

const revalidate = revalidateCollection(CONTENT_TAGS.projects)

/**
 * Files uploaded from the admin.
 * Reading is public so the site pages can display the visuals.
 */
const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Média',
    plural: 'Médias',
  },
  admin: {
    useAsTitle: 'filename',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texte alternatif',
      required: true,
    },
  ],
  hooks: {
    // Project visuals are read through the `cover` relation: replacing a file
    // does not modify the project document, so its cache would never be purged
    // and the page would keep serving the old URL.
    afterChange: [revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
}

export { Media }
