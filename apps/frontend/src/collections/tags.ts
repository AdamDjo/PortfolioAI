import type { CollectionConfig } from 'payload'

/**
 * Tags de classement des liens de veille.
 *
 * Ils sont une collection à part et non un champ texte libre : c'est ce qui permet
 * de renommer un tag une seule fois et de le voir changer partout, et d'éviter les
 * quasi-doublons (« React » / « react » / « ReactJS »).
 */
const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  access: {
    // Le site public lit les tags pour proposer les filtres ; seul l'administrateur les modifie.
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
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Identifiant',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Généré depuis le nom, utilisé dans les URL de filtre.',
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            const name = typeof data?.name === 'string' ? data.name : ''
            return (
              name
                .normalize('NFD')
                // Retire les diacritiques : « Accessibilité » devient « accessibilite ».
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            )
          },
        ],
      },
    },
  ],
}

export { Tags }
