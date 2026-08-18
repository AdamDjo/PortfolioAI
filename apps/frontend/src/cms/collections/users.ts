import type { CollectionConfig } from 'payload'

/**
 * The portfolio's single admin account.
 * No public sign-up: accounts are created from the admin.
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
    // Only authenticated users manage accounts.
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
