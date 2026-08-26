import type { Locale } from '@/lib/i18n/config'

/**
 * Copy for the site frame and other chrome shared by every route.
 *
 * A route's own copy stays in its `_content.ts`; what lives here is the text the
 * layout owns — navigation, footer, document metadata, the skip link — which no
 * single route would be the right home for. Keyed by locale, read on the server
 * and handed to the client islands (nav, switcher) as props.
 */
export interface UiMessages {
  meta: {
    title: string
    description: string
  }
  skipLink: string
  nav: {
    label: string
    openMenu: string
    home: string
    projects: string
    veille: string
    tools: string
    about: string
    contact: string
  }
  footer: {
    contact: string
    privacy: string
    legal: string
  }
  language: string
}

const MESSAGES: Record<Locale, UiMessages> = {
  en: {
    meta: {
      title: 'Adem — Senior Frontend Developer',
      description:
        'Senior frontend developer near Paris. Fast, accessible and maintainable React and Next.js interfaces.',
    },
    skipLink: 'Skip to content',
    nav: {
      label: 'Main navigation',
      openMenu: 'Open the menu',
      home: 'Home',
      projects: 'Projects',
      veille: 'Reading list',
      tools: 'AI tools',
      about: 'About',
      contact: 'Contact',
    },
    footer: {
      contact: 'Get in touch',
      privacy: 'Privacy',
      legal: 'Legal notice',
    },
    language: 'Language',
  },
  fr: {
    meta: {
      title: 'Adem — Développeur Frontend Senior',
      description:
        'Développeur frontend senior en Île-de-France. Interfaces React et Next.js rapides, accessibles et maintenables.',
    },
    skipLink: 'Aller au contenu',
    nav: {
      label: 'Navigation principale',
      openMenu: 'Ouvrir le menu',
      home: 'Accueil',
      projects: 'Projets',
      veille: 'Veille',
      tools: 'Outils IA',
      about: 'À propos',
      contact: 'Contact',
    },
    footer: {
      contact: 'Me contacter',
      privacy: 'Confidentialité',
      legal: 'Mentions légales',
    },
    language: 'Langue',
  },
}

export function getMessages(locale: Locale): UiMessages {
  return MESSAGES[locale]
}
