import type { Locale } from '@/lib/i18n/config'

/**
 * Static editorial copy and metadata for the contact page, one per locale.
 *
 * The identity (email, location) comes from Payload instead — this file only
 * holds strings tied to the page's structure.
 */
const en = {
  metadata: {
    title: 'Contact',
    description: 'Get in touch about frontend work or a technical question.',
  },
  heading: {
    eyebrow: 'Contact',
    title: 'Let’s talk about what you want to build.',
    lead: 'A frontend engagement, a product to restructure, or simply a technical question: drop me a line.',
  },
  details: {
    emailLabel: 'Email',
    locationLabel: 'Location',
  },
  form: {
    nameLabel: 'Name',
    emailLabel: 'Email',
    subjectLabel: 'Subject',
    messageLabel: 'Message',
    submitLabel: 'Send message',
    pendingLabel: 'Sending…',
    successMessage: 'Message sent. I’ll get back to you shortly.',
    /** Shown when no sending domain is configured yet — nothing has failed. */
    unconfiguredMessage: 'Sending is not live yet. In the meantime, write to me directly at',
  },
}

type ContactContent = typeof en

const fr: ContactContent = {
  metadata: {
    title: 'Contact',
    description: 'Me joindre pour une mission frontend ou une question technique.',
  },
  heading: {
    eyebrow: 'Contact',
    title: 'Parlons de ce que tu veux construire.',
    lead: 'Une mission frontend, un produit à restructurer ou simplement une question technique : écris-moi.',
  },
  details: {
    emailLabel: 'Email',
    locationLabel: 'Localisation',
  },
  form: {
    nameLabel: 'Nom',
    emailLabel: 'Email',
    subjectLabel: 'Sujet',
    messageLabel: 'Message',
    submitLabel: 'Envoyer le message',
    pendingLabel: 'Envoi en cours…',
    successMessage: 'Message envoyé. Je te réponds au plus vite.',
    unconfiguredMessage: 'L’envoi n’est pas encore actif. En attendant, écris-moi directement à',
  },
}

const CONTACT_CONTENT: Record<Locale, ContactContent> = { en, fr }

export function getContactContent(locale: Locale): ContactContent {
  return CONTACT_CONTENT[locale]
}
