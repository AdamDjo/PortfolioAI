import { CONTENT_TAGS, revalidateGlobal } from '@/lib/content-cache'

import type { GlobalConfig } from 'payload'

/**
 * Site identity: contact details, social links, legal notice.
 *
 * A global rather than a collection because only one of it exists by nature. A
 * collection would force pages to pick "the first document" — an implicit
 * convention that breaks on the first duplicate.
 *
 * These values used to be hardcoded in the components, which let social links
 * pointing at the GitHub and LinkedIn home pages slip through. Centralising them
 * makes such a mistake visible and fixable in one place.
 */
const SiteIdentity: GlobalConfig = {
  slug: 'site-identity',
  label: 'Identité du site',
  admin: {
    description: 'Coordonnées, liens sociaux et informations légales.',
  },
  access: {
    // The public site reads identity; only the signed-in admin updates it.
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: 'group',
      name: 'contact',
      label: 'Coordonnées',
      fields: [
        {
          name: 'displayName',
          type: 'text',
          label: "Nom d'affichage",
          required: true,
          admin: {
            description:
              "Nom montré sur le site et dans les titres de page. L'identité légale complète se saisit dans « Éditeur », plus bas.",
          },
        },
        {
          name: 'role',
          type: 'text',
          localized: true,
          label: 'Intitulé de poste',
          required: true,
        },
        {
          name: 'location',
          type: 'text',
          localized: true,
          label: 'Localisation',
          admin: {
            description: 'Affichée dans le pied de page et sur la page À propos.',
          },
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email public',
          required: true,
        },
      ],
    },
    {
      type: 'group',
      name: 'social',
      label: 'Liens sociaux',
      fields: [
        {
          name: 'githubUrl',
          type: 'text',
          label: 'GitHub',
        },
        {
          name: 'linkedinUrl',
          type: 'text',
          label: 'LinkedIn',
        },
      ],
    },
    {
      type: 'group',
      name: 'legal',
      label: 'Mentions légales',
      admin: {
        description: 'Sert à générer la page Mentions légales.',
      },
      fields: [
        {
          name: 'publisher',
          type: 'text',
          label: 'Éditeur',
          admin: {
            description:
              'Personne physique ou morale responsable de la publication. La loi exige ici une identité complète : nom et prénom pour un particulier. Seule cette page l’affiche, le reste du site utilise le nom d’affichage.',
          },
        },
        {
          name: 'hostName',
          type: 'text',
          label: 'Hébergeur',
        },
        {
          name: 'hostAddress',
          type: 'textarea',
          label: 'Adresse de l’hébergeur',
        },
        {
          name: 'dataPolicy',
          type: 'textarea',
          localized: true,
          label: 'Traitement des données',
          admin: {
            description: 'Ce que le site collecte, et ce qu’il n’en fait pas.',
          },
        },
      ],
    },
  ],
  hooks: {
    // Identity feeds the header, the footer and the legal notice, so saving it
    // purges the cache of every page that reads it.
    afterChange: [revalidateGlobal(CONTENT_TAGS.identity)],
  },
}

export { SiteIdentity }
