import type { CollectionConfig } from 'payload'

/**
 * Anonymised transcripts of the public assistant.
 *
 * Storing what visitors ask is a collection of personal data even without an
 * address: people state who they are, who they work for and what they are after.
 * So this collection is treated with the same care as `ai-knowledge` — `read` is
 * admin-only, the chat route writes with `overrideAccess` on the server, and no
 * page ever exposes it. Two things keep it anonymous: the caller is identified
 * only by the salted, daily-rotating fingerprint (never an IP), and rows are
 * deleted 30 days after they are written (see `lib/conversation-store`).
 *
 * A row is one conversation, keyed by an opaque id the client generates: turns
 * accumulate in `transcript`, and the single `feedback` value rates the exchange
 * as a whole. Nothing here links a conversation to a real identity.
 */
const Conversations: CollectionConfig = {
  slug: 'conversations',
  labels: {
    singular: 'Conversation',
    plural: 'Conversations',
  },
  admin: {
    useAsTitle: 'conversationId',
    defaultColumns: ['conversationId', 'feedback', 'createdAt'],
    description:
      'Échanges anonymisés avec l’assistant, conservés 30 jours puis supprimés automatiquement.',
  },
  access: {
    // Private by design: personal data, never served to a visitor.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'conversationId',
      type: 'text',
      label: 'Identifiant',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Identifiant opaque généré par le client, sans lien avec une identité.',
      },
    },
    {
      name: 'fingerprint',
      type: 'text',
      label: 'Empreinte',
      admin: {
        description:
          'Empreinte anonyme, salée et changée chaque jour. Ce n’est pas une adresse IP.',
      },
    },
    {
      name: 'transcript',
      type: 'json',
      label: 'Transcription',
      admin: {
        description: 'Les tours de la conversation, dans l’ordre.',
      },
    },
    {
      name: 'feedback',
      type: 'select',
      label: 'Retour du visiteur',
      options: [
        { label: 'Utile', value: 'useful' },
        { label: 'Pas utile', value: 'not_useful' },
      ],
      admin: {
        description: 'Retour laissé sur la réponse, quand le visiteur en donne un.',
      },
    },
  ],
}

export { Conversations }
