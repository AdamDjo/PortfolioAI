import { CONTENT_TAGS, revalidateCollection } from '@/lib/content-cache'

import type { CollectionConfig } from 'payload'

const revalidate = revalidateCollection(CONTENT_TAGS.aiTools)

/**
 * AI tooling I keep at hand: Claude Code skills, plugins and MCP servers.
 *
 * The point of the page is the `snippet` field. Everything else is context that
 * helps a visitor decide whether the snippet is worth copying; the snippet is
 * what they actually leave with.
 *
 * A single collection with a `kind` select rather than three collections: the
 * three types differ only by the label above the snippet, and sharing one shape
 * is what lets the page offer a single filter row over all of them.
 *
 * Writing is restricted to the signed-in admin, exactly like `bookmarks`: the
 * page is public to read and closed to contributions.
 */
const AITools: CollectionConfig = {
  slug: 'ai-tools',
  labels: { singular: 'Outil IA', plural: 'Outils IA' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'active', 'updatedAt'],
    description: 'Skills, plugins et serveurs MCP affichés sur /outils-ia.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
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
    {
      name: 'kind',
      type: 'select',
      label: 'Type',
      required: true,
      index: true,
      defaultValue: 'skill',
      options: [
        { label: 'Skill', value: 'skill' },
        { label: 'Plugin', value: 'plugin' },
        { label: 'Serveur MCP', value: 'mcp' },
      ],
      admin: {
        description: 'Décide du filtre sous lequel l’outil apparaît.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
      admin: {
        description: 'Une ou deux phrases : à quoi sert l’outil, pas comment il marche.',
      },
    },
    {
      name: 'snippet',
      type: 'textarea',
      label: 'À copier',
      required: true,
      admin: {
        description:
          'Commande d’installation pour un skill ou un plugin, bloc de configuration pour un MCP. C’est le contenu du bouton « Copier ».',
      },
      validate: (value: string | null | undefined) =>
        typeof value === 'string' && value.trim() !== ''
          ? true
          : 'Un outil sans contenu à copier n’a rien à faire sur la page.',
    },
    {
      name: 'url',
      type: 'text',
      label: 'Lien (optionnel)',
      admin: {
        description: 'Dépôt ou documentation. Affiché en lien discret sur la carte.',
      },
      validate: (value: string | null | undefined) => {
        if (typeof value !== 'string' || value.trim() === '') return true
        try {
          const { protocol } = new URL(value)
          return protocol === 'http:' || protocol === 'https:'
            ? true
            : 'Le lien doit être en http(s).'
        } catch {
          return 'Cette adresse n’est pas une URL valide.'
        }
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Visible sur le site',
      defaultValue: true,
      index: true,
      admin: {
        description: 'Décochez pour retirer l’outil du site sans le supprimer.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
}

export { AITools }
