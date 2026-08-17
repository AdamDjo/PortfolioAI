import { CONTENT_TAGS, revalidateCollection } from '../lib/content-cache'
import { withOpenGraphPreview } from '../lib/open-graph-hook'

import type { CollectionConfig } from 'payload'

const revalidate = revalidateCollection(CONTENT_TAGS.projects)

/**
 * Portfolio projects, described first and foremost by their URL.
 *
 * The visual preview is fetched automatically from the target page's Open Graph
 * tags, so no upload is needed in the common case. The `cover` field stays
 * available when the remote site exposes no usable image, and it always wins at
 * display time.
 */
const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Projet', plural: 'Projets' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'url', 'featured', 'updatedAt'],
    description:
      "Renseignez l'URL : le titre, la description et l'image d'aperçu sont récupérés automatiquement.",
  },
  access: {
    // The public site reads projects; only the admin modifies them.
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'URL du projet',
      required: true,
      unique: true,
      admin: {
        description: 'Adresse publique du projet, en https.',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      admin: {
        description: 'Laissez vide pour reprendre le titre de la page distante.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Laissez vide pour reprendre la description de la page distante.',
      },
    },
    {
      name: 'previewImageUrl',
      type: 'text',
      label: "Image d'aperçu (automatique)",
      admin: {
        readOnly: true,
        description: "Extraite des balises Open Graph à chaque modification de l'URL.",
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Visuel personnalisé',
      admin: {
        description:
          "Optionnel. Prend le pas sur l'image d'aperçu automatique quand il est renseigné.",
      },
    },
    {
      name: 'repositoryUrl',
      type: 'text',
      label: 'Dépôt source',
      admin: {
        description: 'Optionnel. Affiché à côté du lien de démonstration.',
      },
    },
    {
      name: 'technologies',
      type: 'text',
      label: 'Technologies',
      hasMany: true,
      admin: {
        description: 'Affichées en surtitre de la carte projet.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: "Mettre en avant sur l'accueil",
      defaultValue: false,
    },
    {
      name: 'order',
      type: 'number',
      label: 'Ordre d’affichage',
      defaultValue: 0,
      index: true,
      admin: {
        description:
          'Croissant : 0 en premier. À valeur égale, les projets les plus récents passent devant.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      withOpenGraphPreview({
        url: 'url',
        title: 'title',
        description: 'description',
        imageUrl: 'previewImageUrl',
      }),
    ],
    afterChange: [revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
}

export { Projects }
