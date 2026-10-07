import { CONTENT_TAGS, revalidateGlobal } from '@/lib/content-cache'

import type { GlobalConfig } from 'payload'

/**
 * Toggle for the services section of `/parcours`.
 *
 * A freelance offer is optional by nature: it can be pulled without a redeploy
 * the moment the owner is fully booked, and put back the same way.
 *
 * The slug and the `enabled` column predate the merge of `/services` into
 * `/parcours` (#98) and are kept as is: renaming them would need a migration
 * for a change no visitor sees.
 */
const ServicesSettings: GlobalConfig = {
  slug: 'services-settings',
  label: 'Section Services',
  admin: {
    description: 'Visibilité de la section Services, en bas de la page /parcours.',
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
      label: 'Section affichée',
      defaultValue: true,
      admin: {
        description:
          'Décoché, la section Services disparaît de /parcours. L’ancienne adresse /services mène toujours à /parcours.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal(CONTENT_TAGS.servicesSettings)],
  },
}

export { ServicesSettings }
