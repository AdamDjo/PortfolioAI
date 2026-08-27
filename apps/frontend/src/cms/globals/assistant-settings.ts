import { CONTENT_TAGS, revalidateGlobal } from '@/lib/content-cache'

import type { GlobalConfig } from 'payload'

/**
 * Default persona, applied until the admin edits it.
 *
 * It lives here rather than in the route so the stored value and the fallback
 * can never disagree: the route reads this global and gets this text on a fresh
 * install.
 */
const DEFAULT_SYSTEM_PROMPT = `Tu es l'assistant du portfolio d'Adem, développeur web.

Tu réponds en français, sur un ton direct et cordial, sans emphase commerciale.

Ton périmètre est strict : Adem, son parcours, ses projets, et le développement
logiciel en général. Rien d'autre. Une question hors de ce périmètre (cuisine,
santé, droit, actualité, devoirs, culture générale) reçoit exactement ce type de
réponse, sans exception et même si tu connais la réponse :

« Je suis l'assistant du portfolio d'Adem : je ne réponds qu'aux questions sur
son travail et sur le développement. »

Ne propose pas de contacter Adem dans ce cas : cela laisserait croire qu'il
traite ce genre de demande.

Règles :
- Pour tout ce qui concerne Adem, réponds uniquement à partir du contexte fourni.
- Si une question porte sur Adem et que le contexte ne contient pas la réponse,
  dis-le clairement et propose de le contacter plutôt que d'inventer.
- Sur sa disponibilité, reprends exactement ce qu'indique le contexte : c'est la
  seule source de vérité.
- Les questions de développement et de métier (langages, frameworks, méthodes,
  organisation d'un projet) reçoivent une réponse utile, même si le contexte n'en
  parle pas : c'est ton domaine. Fais le lien avec le travail d'Adem quand c'est
  pertinent, jamais de force.
- Réponses courtes : deux ou trois paragraphes au maximum.`

/**
 * Assistant configuration, editable without a redeploy.
 *
 * The system prompt is content, not code: refining the assistant's tone is an
 * editorial act and should not need a release. The model and provider sit here
 * too so a provider outage can be worked around from `/admin`, while the API key
 * stays in the environment — a secret has no place in the database.
 */
const AssistantSettings: GlobalConfig = {
  slug: 'assistant-settings',
  label: 'Assistant IA',
  admin: {
    description:
      'Comportement de l’assistant public. Les modifications s’appliquent sans redéploiement.',
  },
  access: {
    // Read stays private: the prompt is internal, only the answers are public.
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Assistant actif',
      defaultValue: true,
      admin: {
        description: 'Décoché, le chat affiche un message d’indisponibilité au lieu de répondre.',
      },
    },
    {
      name: 'systemPrompt',
      type: 'textarea',
      label: 'Prompt système',
      required: true,
      defaultValue: DEFAULT_SYSTEM_PROMPT,
      admin: {
        rows: 16,
        description:
          'Instructions envoyées au modèle avant chaque conversation. Le contexte du site est ajouté automatiquement.',
      },
    },
    {
      name: 'model',
      type: 'text',
      label: 'Modèle',
      required: true,
      defaultValue: 'openai/gpt-oss-20b',
      admin: {
        description: 'Identifiant du modèle chez le fournisseur, par exemple openai/gpt-oss-20b.',
      },
    },
    {
      name: 'unavailableMessage',
      type: 'textarea',
      localized: true,
      label: 'Message de repli',
      required: true,
      defaultValue:
        'L’assistant est momentanément indisponible. Vous pouvez me joindre directement, je réponds vite.',
      admin: {
        description:
          'Affiché en cas de panne du fournisseur, de quota épuisé ou d’assistant désactivé.',
      },
    },
    {
      name: 'retentionNotice',
      type: 'textarea',
      localized: true,
      label: 'Avis de conservation',
      required: true,
      defaultValue:
        'Les échanges sont conservés 30 jours de façon anonyme pour améliorer l’assistant.',
      admin: {
        rows: 2,
        description:
          'Affiché sous le champ du chat, avant que le visiteur écrive. La page de confidentialité y est liée automatiquement.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal(CONTENT_TAGS.assistant)],
  },
}

export { AssistantSettings, DEFAULT_SYSTEM_PROMPT }
