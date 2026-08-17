import { canonicalizeUrl } from '../lib/canonical-url'
import { withOpenGraphPreview } from '../lib/open-graph-hook'

import type { CollectionConfig } from 'payload'

/**
 * Liens de veille.
 *
 * Le geste visé est minimal : coller une URL, rien d'autre. Le titre, la
 * description, l'image d'aperçu et le domaine sont récupérés depuis les balises
 * Open Graph de la page cible, donc aucun téléversement n'est nécessaire.
 *
 * L'écriture est réservée à l'administrateur connecté : les visiteurs consultent
 * la liste mais ne peuvent pas l'alimenter. C'est délibéré — un formulaire ouvert
 * serait une porte à spam sur une page publique.
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
  },
}

export { Bookmarks }
