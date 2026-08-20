/**
 * Static editorial copy and metadata for the contact page.
 *
 * The identity (email, location) comes from Payload instead — this file only
 * holds strings tied to the page's structure.
 */
export const CONTACT_CONTENT = {
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
    /** Shown when no sending domain is configured yet — nothing has failed. */
    unconfiguredMessage: 'L’envoi n’est pas encore actif. En attendant, écris-moi directement à',
  },
} as const
