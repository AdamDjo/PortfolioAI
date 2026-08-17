import { fetchOpenGraphMetadata } from '../lib/open-graph'

import type { CollectionConfig } from 'payload'

/**
 * Lit une valeur de formulaire comme texte utile.
 *
 * Un champ vidé depuis l'administration arrive comme chaîne vide, pas comme
 * `null` : on le traite donc comme absent afin que la valeur automatique
 * reprenne la main.
 */
const readTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

/**
 * Projets du portfolio, décrits d'abord par leur URL.
 *
 * L'aperçu visuel est récupéré automatiquement depuis les balises Open Graph de
 * la page cible : aucun téléversement n'est nécessaire dans le cas courant. Le
 * champ `cover` reste disponible quand le site distant n'expose pas d'image
 * exploitable, et il a toujours la priorité à l'affichage.
 */
const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Projet', plural: 'Projets' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'url', 'featured', 'updatedAt'],
    description:
      "Renseignez l'URL : le titre, la description et l'image d'aperçu sont récupérés automatiquement.",
  },
  access: {
    // Le site public lit les projets ; seule l'administration les modifie.
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'URL du projet',
      required: true,
      unique: true,
      admin: {
        description: 'Adresse publique du projet, en https.',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      admin: {
        description: 'Laissez vide pour reprendre le titre de la page distante.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Laissez vide pour reprendre la description de la page distante.',
      },
    },
    {
      name: 'previewImageUrl',
      type: 'text',
      label: "Image d'aperçu (automatique)",
      admin: {
        readOnly: true,
        description: "Extraite des balises Open Graph à chaque modification de l'URL.",
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Visuel personnalisé',
      admin: {
        description:
          "Optionnel. Prend le pas sur l'image d'aperçu automatique quand il est renseigné.",
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: "Mettre en avant sur l'accueil",
      defaultValue: false,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation }) => {
        const url = readTrimmedString(data.url)
        if (!url) return data

        // On n'interroge le site distant que si l'URL est nouvelle ou a changé,
        // pour ne pas déclencher une requête à chaque sauvegarde.
        const previousUrl = readTrimmedString(
          (originalDoc as Record<string, unknown> | undefined)?.url
        )
        if (operation !== 'create' && url === previousUrl) return data

        const metadata = await fetchOpenGraphMetadata(url)

        return {
          ...data,
          url,
          previewImageUrl: metadata.imageUrl,
          // Les valeurs saisies à la main ne sont jamais écrasées.
          title: readTrimmedString(data.title) ?? metadata.title ?? url,
          description: readTrimmedString(data.description) ?? metadata.description ?? undefined,
        }
      },
    ],
  },
}

export { Projects }
