import { CONTENT_TAGS, revalidateGlobal } from '@/lib/content-cache'

import type { GlobalConfig } from 'payload'

/**
 * Contenu éditorial de la page À propos : biographie, principes, compétences.
 *
 * Les compétences sont décrites par catégorie et par liste d'outils, sans
 * pourcentage de maîtrise. Un niveau chiffré ne repose sur aucune mesure — il se
 * lit comme une donnée alors qu'il n'en est pas une, et il est indéfendable en
 * entretien. Les regrouper par domaine dit la même chose sans inventer un chiffre.
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
      label: 'Titre de la page',
      required: true,
    },
    {
      name: 'bio',
      type: 'textarea',
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
          label: 'Énoncé',
          required: true,
        },
        {
          name: 'detail',
          type: 'textarea',
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
