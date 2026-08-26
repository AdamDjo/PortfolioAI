import type { Locale } from '@/lib/i18n/config'

/**
 * Strings the assistant endpoint returns to the visitor, plus the instruction
 * that pins the model's reply language.
 *
 * These are not page copy, so they do not belong to a route's `_content.ts`, and
 * they are read from a route handler, which cannot reach the `[lang]` root
 * param — the locale travels in the request body instead.
 */
interface AssistantMessages {
  rateLimited: string
  /** Shown in the chat when the request never reached the server. */
  networkError: string
  /** Appended to the system prompt so the answer matches the site's language. */
  languageInstruction: string
}

const MESSAGES: Record<Locale, AssistantMessages> = {
  en: {
    rateLimited:
      'You have asked a lot of questions in a row. Give the assistant a minute to catch up, or write to me directly from the /contact page.',
    networkError:
      'The connection failed. Check your network and try again, or contact me directly.',
    languageInstruction:
      'The visitor is browsing the site in English. Answer in English, even though the context below is written in French.',
  },
  fr: {
    rateLimited:
      'Vous avez posé beaucoup de questions d’affilée. Laissez souffler l’assistant une minute, ou écrivez-moi directement depuis la page /contact.',
    networkError:
      'La connexion a échoué. Vérifiez votre réseau et réessayez, ou contactez-moi directement.',
    languageInstruction: 'Le visiteur consulte le site en français. Réponds en français.',
  },
}

export function getAssistantMessages(locale: Locale): AssistantMessages {
  return MESSAGES[locale]
}
