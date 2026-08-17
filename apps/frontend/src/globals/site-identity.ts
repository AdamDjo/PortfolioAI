import { CONTENT_TAGS, revalidateGlobal } from '@/lib/content-cache'

import type { GlobalConfig } from 'payload'

/**
 * Identité du site : coordonnées, liens sociaux, mentions légales.
 *
 * C'est un global et non une collection parce qu'il n'en existe qu'un seul
 * exemplaire par nature. Une collection obligerait les pages à choisir « le
 * premier document » — une convention implicite qui casse au premier doublon.
 *
 * Ces valeurs étaient auparavant codées en dur dans les composants, ce qui a
 * laissé passer des liens sociaux pointant vers les pages d'accueil de GitHub et
 * LinkedIn. Les centraliser rend l'erreur visible et corrigeable en un endroit.
 */
const SiteIdentity: GlobalConfig = {
  slug: 'site-identity',
  label: 'Identité du site',
  admin: {
    description: 'Coordonnées, liens sociaux et informations légales.',
  },
  access: {
    // Le site public lit l'identité ; seul l'administrateur connecté la modifie.
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
          label: 'Intitulé de poste',
          required: true,
        },
        {
          name: 'location',
          type: 'text',
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
          label: 'Traitement des données',
          admin: {
            description: 'Ce que le site collecte, et ce qu’il n’en fait pas.',
          },
        },
      ],
    },
  ],
  hooks: {
    // L'identité alimente l'en-tête, le pied de page et les mentions légales :
    // sa sauvegarde purge le cache de toutes les pages qui la lisent.
    afterChange: [revalidateGlobal(CONTENT_TAGS.identity)],
  },
}

export { SiteIdentity }
