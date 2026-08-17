import { canonicalizeUrl } from '../lib/canonical-url'
import { CONTENT_TAGS, revalidateCollection } from '../lib/content-cache'
import { withOpenGraphPreview } from '../lib/open-graph-hook'

import type { CollectionConfig } from 'payload'

const revalidate = revalidateCollection(CONTENT_TAGS.bookmarks)

/**
 * Veille links.
 *
 * The intended gesture is minimal: paste a URL, nothing else. Title,
 * description, preview image and domain are pulled from the target page's Open
 * Graph tags, so no upload is needed.
 *
 * Writing is restricted to the signed-in admin: visitors read the list but
 * cannot feed it. That is deliberate — an open form would be a spam door on a
 * public page.
 */
const Bookmarks: CollectionConfig = {
  slug: 'bookmarks',
  labels: { singular: 'Lien de veille', plural: 'Liens de veille' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'domain', 'active', 'updatedAt'],
    description: "Collez l'URL : le reste est récupéré automatiquement.",
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Normalisée automatiquement : les paramètres de suivi sont retirés.',
      },
      validate: (value: string | null | undefined) => {
        if (typeof value !== 'string' || value.trim() === '') return 'Une URL est requise.'
        return canonicalizeUrl(value) ? true : 'Cette adresse n’est pas une URL http(s) valide.'
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
      name: 'domain',
      type: 'text',
      label: 'Domaine (automatique)',
      index: true,
      admin: {
        readOnly: true,
        description: "Déduit de l'URL, utilisé pour l'affichage et le favicon.",
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
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Tags',
      admin: {
        description: 'Sert aux filtres de la page Veille.',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Visible sur le site',
      defaultValue: true,
      index: true,
      admin: {
        description: 'Décochez pour retirer le lien du site sans le supprimer.',
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
        domain: 'domain',
      }),
    ],
    // A link added from `/veille` must show up on the home page without delay.
    afterChange: [revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
}

export { Bookmarks }
