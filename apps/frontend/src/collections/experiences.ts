import { CONTENT_TAGS, revalidateCollection } from '@/lib/content-cache'

import type { CollectionConfig } from 'payload'

const revalidate = revalidateCollection(CONTENT_TAGS.experiences)

/**
 * Parcours professionnel.
 *
 * Une collection plutôt qu'un tableau dans un global : chaque poste a son propre
 * cycle de vie éditorial, et le tri chronologique se fait alors côté base plutôt
 * qu'à la main dans l'interface.
 *
 * Aucun champ URL ici, volontairement : ces missions sont des back-offices
 * internes, sans adresse publique à montrer. Les projets démontrables vivent dans
 * la collection `projects`.
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
      label: 'Poste',
      required: true,
    },
    {
      name: 'location',
      type: 'text',
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
      label: 'Produit',
      admin: {
        description: 'Optionnel : le produit sur lequel porte la mission.',
      },
    },
    {
      name: 'context',
      type: 'textarea',
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
    // La suppression compte autant que l'ajout : un poste retiré doit disparaître
    // du parcours sans attendre.
    afterChange: [revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
}

export { Experiences }
