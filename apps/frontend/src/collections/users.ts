import type { CollectionConfig } from 'payload'

/**
 * Compte administrateur unique du portfolio.
 * Aucune inscription publique : les comptes sont créés depuis l'administration.
 */
const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Utilisateur',
    plural: 'Utilisateurs',
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'updatedAt'],
  },
  access: {
    // Seuls les utilisateurs authentifiés gèrent les comptes.
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nom',
      required: true,
    },
  ],
}

export { Users }
