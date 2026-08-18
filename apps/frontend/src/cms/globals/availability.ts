import { CONTENT_TAGS, revalidateGlobal } from '@/lib/content-cache'

import type { GlobalConfig } from 'payload'

/**
 * Availability status shown by the hero badge and used by the AI assistant.
 *
 * A global rather than a field on `profile`: availability changes on its own
 * rhythm — several times a year, independently of the biography — and it is the
 * one piece of content the assistant must never answer from memory. Keeping it
 * separate means updating it does not force the About page to be read again.
 *
 * The public label stays editable because "available" covers very different
 * situations: open to offers, open to freelance work, or booked until a given
 * month. A boolean alone would force that nuance into the code.
 */
const Availability: GlobalConfig = {
  slug: 'availability',
  label: 'Disponibilité',
  admin: {
    description:
      'Statut affiché sur l’accueil et utilisé par l’assistant. Modifiable sans redéploiement.',
  },
  access: {
    // The public site reads the status; only the signed-in admin updates it.
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'available',
      type: 'checkbox',
      label: 'Disponible',
      defaultValue: true,
      admin: {
        description:
          'Décoché, le badge de l’accueil s’affiche en état indisponible et l’assistant répond en conséquence.',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: 'Texte affiché',
      required: true,
      defaultValue: 'Disponible pour des opportunités',
      admin: {
        description: 'Phrase courte montrée dans le badge de l’accueil.',
      },
    },
    {
      name: 'detail',
      type: 'textarea',
      label: 'Précision pour l’assistant',
      admin: {
        description:
          'Optionnel. Contexte que l’assistant peut donner : type de mission recherché, date de disponibilité, préférence sur le télétravail.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal(CONTENT_TAGS.availability)],
  },
}

export { Availability }
