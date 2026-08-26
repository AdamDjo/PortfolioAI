import type { Locale } from '@/lib/i18n/config'

/**
 * Static content, one version per locale: this page describes how the assistant
 * handles data, which is a property of the code, not something edited from
 * `/admin`. It must stay in step with `lib/conversation-store` and
 * `lib/ai/client-fingerprint` — the retention window and the fingerprint rule
 * are stated here as they are implemented.
 */
const en = {
  metadata: {
    title: 'Privacy policy',
    description:
      'What the portfolio assistant collects, why, how long it is kept and how to ask for deletion.',
  },
  heading: {
    eyebrow: 'Privacy',
    title: 'Privacy policy',
    lead: 'This page covers the site’s conversational assistant only. The rest of the site collects nothing personal.',
  },
  sections: [
    {
      title: 'What is collected',
      body: [
        'When you write to the assistant, the conversation is stored: your questions and its answers. Many people mention who they are or what they are looking for — so it is treated as personal data.',
        'No IP address is stored. To limit abuse, a technical fingerprint is derived from your address, but it is salted with a secret and rotates daily: it cannot be traced back to the address, nor used to follow you from one day to the next.',
      ],
    },
    {
      title: 'Why',
      body: [
        'Conversations are used to improve the assistant and to understand what visitors expect from the site. The “helpful / not helpful” feedback you can leave on an answer is kept with the conversation it belongs to, always anonymously.',
      ],
    },
    {
      title: 'For how long',
      body: [
        'Conversations are kept for thirty days, then deleted automatically. None is kept beyond that.',
      ],
    },
    {
      title: 'Your rights',
      body: [
        'Because a conversation is tied to no identity, it cannot be found from your name. If you would still like an exchange deleted before its deadline, write to me from the contact page with something to go on (the date, the topic) and I will take care of it.',
      ],
    },
  ],
}

type PrivacyContent = typeof en

const fr: PrivacyContent = {
  metadata: {
    title: 'Politique de confidentialité',
    description:
      'Ce que l’assistant du portfolio collecte, pourquoi, combien de temps c’est conservé et comment demander une suppression.',
  },
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
}

const PRIVACY_CONTENT: Record<Locale, PrivacyContent> = { en, fr }

export function getPrivacyContent(locale: Locale): PrivacyContent {
  return PRIVACY_CONTENT[locale]
}
