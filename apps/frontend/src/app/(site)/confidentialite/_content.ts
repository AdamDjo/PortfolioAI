import type { Metadata } from 'next'

const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Ce que l’assistant du portfolio collecte, pourquoi, combien de temps c’est conservé et comment demander une suppression.',
}

/**
 * Static content: this page describes how the assistant handles data, which is a
 * property of the code, not something edited from `/admin`. It must stay in step
 * with `lib/conversation-store` and `lib/ai/client-fingerprint` — the retention
 * window and the fingerprint rule are stated here as they are implemented.
 */
const PRIVACY_CONTENT = {
  metadata,
  heading: {
    eyebrow: 'Confidentialité',
    title: 'Politique de confidentialité',
    lead: 'Cette page ne concerne que l’assistant conversationnel du site. Le reste de la navigation ne collecte rien de personnel.',
  },
  sections: [
    {
      title: 'Ce qui est collecté',
      body: [
        'Lorsque vous écrivez à l’assistant, la conversation est enregistrée : vos questions et ses réponses. Beaucoup de gens y indiquent qui ils sont ou ce qu’ils cherchent — c’est donc traité comme une donnée personnelle.',
        'Aucune adresse IP n’est enregistrée. Pour limiter les abus, une empreinte technique est calculée à partir de votre adresse, mais elle est salée avec un secret et change chaque jour : elle ne permet ni de remonter à l’adresse, ni de vous suivre d’un jour à l’autre.',
      ],
    },
    {
      title: 'Pourquoi',
      body: [
        'Les conversations servent à améliorer l’assistant et à comprendre ce que les visiteurs attendent du site. Le retour « utile / pas utile » que vous pouvez laisser sur une réponse est conservé avec la conversation concernée, toujours de façon anonyme.',
      ],
    },
    {
      title: 'Combien de temps',
      body: [
        'Les conversations sont conservées trente jours, puis supprimées automatiquement. Aucune n’est gardée au-delà.',
      ],
    },
    {
      title: 'Vos droits',
      body: [
        'Une conversation n’étant liée à aucune identité, elle ne peut pas être retrouvée à partir de votre nom. Si vous souhaitez malgré tout qu’un échange soit supprimé avant son échéance, écrivez-moi depuis la page de contact en indiquant un repère (la date, le sujet abordé) et je m’en occupe.',
      ],
    },
  ],
} as const

export { PRIVACY_CONTENT }
