import { buildResetPasswordEmail, RESET_PASSWORD_SUBJECT } from '../emails/reset-password'

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
  auth: {
    /**
     * Lockout policy, written down rather than inherited.
     *
     * These two happen to match Payload's current defaults, and that is the
     * point: a brute-force ceiling that lives in a framework default is one
     * upgrade away from changing without anyone noticing. Five attempts then ten
     * minutes of lockout is the decision, and it is reviewable here.
     */
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    forgotPassword: {
      generateEmailSubject: () => RESET_PASSWORD_SUBJECT,
      generateEmailHTML: (args) =>
        buildResetPasswordEmail({ token: args?.token, requestOrigin: args?.req?.origin }),
    },
  },
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
