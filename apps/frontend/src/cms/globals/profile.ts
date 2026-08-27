import { CONTENT_TAGS, revalidateGlobal } from '@/lib/content-cache'

import type { GlobalConfig } from 'payload'

/**
 * Editorial content of the About page: biography, principles, skills.
 *
 * Skills are described by category and by list of tools, without a mastery
 * percentage. A numeric level rests on no measurement — it reads as data while
 * being nothing of the sort, and it is indefensible in an interview. Grouping by
 * domain says the same thing without inventing a figure.
 */
const Profile: GlobalConfig = {
  slug: 'profile',
  label: 'Profil',
  admin: {
    description: 'Biographie, compétences et principes affichés sur la page À propos.',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      localized: true,
      label: 'Titre de la page',
      required: true,
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
      label: 'Biographie',
      required: true,
      admin: {
        description: 'Deux à trois phrases, à la première personne.',
      },
    },
    {
      name: 'yearsOfExperience',
      type: 'number',
      label: 'Années d’expérience',
      min: 0,
      admin: {
        description: 'Seul chiffre affiché en haut de page. Laissez vide pour le masquer.',
      },
    },
    {
      name: 'skillGroups',
      type: 'array',
      label: 'Compétences par domaine',
      labels: { singular: 'Domaine', plural: 'Domaines' },
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          label: 'Domaine',
          required: true,
        },
        {
          name: 'items',
          type: 'text',
          label: 'Outils et technologies',
          required: true,
          hasMany: true,
        },
      ],
    },
    {
      name: 'principles',
      type: 'array',
      label: 'Principes de travail',
      labels: { singular: 'Principe', plural: 'Principes' },
      fields: [
        {
          name: 'statement',
          type: 'text',
          localized: true,
          label: 'Énoncé',
          required: true,
        },
        {
          name: 'detail',
          type: 'textarea',
          localized: true,
          label: 'Précision',
          admin: {
            description: 'Optionnel : ce que le principe change concrètement.',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal(CONTENT_TAGS.profile)],
  },
}

export { Profile }
