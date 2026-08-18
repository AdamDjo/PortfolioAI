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
    successMessage:
      'Le service d’envoi n’est pas encore branché. En attendant, écris-moi directement à',
  },
} as const
