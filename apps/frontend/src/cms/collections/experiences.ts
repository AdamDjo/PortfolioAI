import { CONTENT_TAGS, revalidateCollection } from '@/lib/content-cache'

import type { CollectionConfig } from 'payload'

const revalidate = revalidateCollection(CONTENT_TAGS.experiences)

/**
 * Professional career path.
 *
 * A collection rather than an array inside a global: each role has its own
 * editorial lifecycle, and chronological sorting then happens in the database
 * instead of by hand in the interface.
 *
 * No URL field here, deliberately: these assignments are internal back-offices
 * with no public address to show. Demonstrable work lives in the `projects`
 * collection.
 */
const Experiences: CollectionConfig = {
  slug: 'experiences',
  labels: { singular: 'Expérience', plural: 'Expériences' },
  admin: {
    useAsTitle: 'company',
    defaultColumns: ['company', 'role', 'startDate', 'current'],
    description: 'Postes affichés sur la page À propos, du plus récent au plus ancien.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'company',
      type: 'text',
      label: 'Entreprise',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      localized: true,
      label: 'Poste',
      required: true,
    },
    {
      name: 'location',
      type: 'text',
      localized: true,
      label: 'Lieu',
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Date de début',
      required: true,
      index: true,
      admin: {
        date: { pickerAppearance: 'monthOnly', displayFormat: 'MM/yyyy' },
        description: 'Sert au tri du parcours.',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'Date de fin',
      admin: {
        date: { pickerAppearance: 'monthOnly', displayFormat: 'MM/yyyy' },
        description: 'Laissez vide pour le poste en cours.',
        condition: (data) => !data?.current,
      },
    },
    {
      name: 'current',
      type: 'checkbox',
      label: 'Poste actuel',
      defaultValue: false,
      admin: {
        description: 'Affiche « Aujourd’hui » à la place de la date de fin.',
      },
    },
    {
      name: 'project',
      type: 'textarea',
      localized: true,
      label: 'Produit',
      admin: {
        description: 'Optionnel : le produit sur lequel porte la mission.',
      },
    },
    {
      name: 'context',
      type: 'textarea',
      localized: true,
      label: 'Contexte',
      admin: {
        description: 'Équipe, périmètre, enjeu de la mission.',
      },
    },
    {
      name: 'achievements',
      type: 'array',
      label: 'Réalisations',
      labels: { singular: 'Réalisation', plural: 'Réalisations' },
      fields: [
        {
          name: 'statement',
          type: 'textarea',
          localized: true,
          label: 'Réalisation',
          required: true,
        },
      ],
    },
    {
      name: 'technologies',
      type: 'text',
      label: 'Technologies',
      hasMany: true,
    },
  ],
  hooks: {
    // Deletion matters as much as creation: a removed role must disappear from
    // the career path right away.
    afterChange: [revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
}

export { Experiences }
