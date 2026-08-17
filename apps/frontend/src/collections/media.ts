import { CONTENT_TAGS, revalidateCollection } from '../lib/content-cache'

import type { CollectionConfig } from 'payload'

const revalidate = revalidateCollection(CONTENT_TAGS.projects)

/**
 * Fichiers téléversés depuis l'administration.
 * La lecture est publique afin que les pages du site puissent afficher les visuels.
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
    // Les visuels de projets sont lus à travers la relation `cover` : remplacer un
    // fichier ne modifie pas le document projet, donc son cache ne serait jamais
    // purgé et la page continuerait de servir l'ancienne URL.
    afterChange: [revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
}

export { Media }
