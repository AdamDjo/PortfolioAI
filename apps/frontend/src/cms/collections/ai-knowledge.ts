import { CONTENT_TAGS, revalidateCollection } from '@/lib/content-cache'

import type { CollectionConfig } from 'payload'

const { afterChange, afterDelete } = revalidateCollection(CONTENT_TAGS.aiKnowledge)

/**
 * Curated answers the assistant is allowed to give about Adem.
 *
 * The rest of the CMS is public by definition — it is what the site displays.
 * This collection is the opposite: it holds what the assistant may say but no
 * page shows, so `read` is restricted to the signed-in admin. The context
 * builder reads it with `overrideAccess: true` on the server, which is the only
 * place that is legitimate: the entries reach visitors as generated prose, never
 * as an API response.
 *
 * `published` gates an entry without deleting it: a half-written answer stays in
 * `/admin` while remaining invisible to the model.
 *
 * Security note: `read` being admin-only protects the API, not the content. Every
 * published entry is fed to the assistant, and a visitor can coax a model into
 * repeating its context (prompt injection). So treat this collection as readable
 * by any visitor through the chat: put here only what Adem would say out loud,
 * never a private note, an address, or anything that must not leave the site.
 */
const AIKnowledge: CollectionConfig = {
  slug: 'ai-knowledge',
  labels: {
    singular: 'Connaissance IA',
    plural: 'Connaissances IA',
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'published'],
    description:
      'Réponses que l’assistant peut donner sur Adem. Ce contenu n’est jamais affiché sur le site et n’est pas exposé publiquement.',
  },
  access: {
    // Private by design: everything here feeds the model, nothing here is a page.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      label: 'Question',
      required: true,
      admin: {
        description: 'La question telle qu’un visiteur la poserait.',
      },
    },
    {
      name: 'answer',
      type: 'textarea',
      label: 'Réponse',
      required: true,
      admin: {
        description: 'Ce que l’assistant doit répondre. Écrit à la troisième personne.',
      },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Catégorie',
      defaultValue: 'parcours',
      options: [
        { label: 'Parcours', value: 'parcours' },
        { label: 'Compétences', value: 'competences' },
        { label: 'Méthode de travail', value: 'methode' },
        { label: 'Collaboration', value: 'collaboration' },
        { label: 'Autre', value: 'autre' },
      ],
      admin: {
        description: 'Sert à regrouper les entrées dans le contexte envoyé au modèle.',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      label: 'Publiée',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Décochée, l’entrée reste ici sans jamais être transmise au modèle.',
      },
    },
  ],
  hooks: {
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
}

export { AIKnowledge }
