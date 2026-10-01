import { CONTENT_TAGS, revalidateGlobal } from '@/lib/content-cache'

import type { GlobalConfig } from 'payload'

/**
 * Toggle for the `/services` page.
 *
 * A freelance offer page is optional by nature: it can be pulled without a
 * redeploy the moment the owner is fully booked, and put back the same way.
 */
const ServicesSettings: GlobalConfig = {
  slug: 'services-settings',
  label: 'Page Services',
  admin: {
    description: 'Visibilité de la page /services.',
  },
  access: {
    // The public page must read its own toggle; only the signed-in admin edits it.
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Page active',
      defaultValue: true,
      admin: {
        description: 'Décoché, la page /services n’est plus accessible et redirige vers l’accueil.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal(CONTENT_TAGS.servicesSettings)],
  },
}

export { ServicesSettings }
