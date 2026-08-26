import type { Locale } from '@/lib/i18n/config'

/**
 * Static editorial copy and metadata for the AI tooling page, one per locale.
 *
 * The tools themselves come from Payload — this file only holds strings tied to
 * the page's structure.
 */
const en = {
  metadata: {
    title: 'AI tools',
    description: 'The skills, plugins and MCP servers I use daily, ready to copy.',
  },
  heading: {
    eyebrow: 'AI tools',
    title: 'My skills, plugins and MCP servers, ready to copy.',
    lead: 'What I install on my own machines. Every card carries its command or its configuration: one click on “Copy” and it is on your clipboard.',
  },
  filter: {
    allKinds: 'All',
    ariaLabel: 'Filter by tool type',
  },
  /** Filter labels and the caption above each snippet, per kind. */
  kinds: {
    skill: { label: 'Skills', snippetLabel: 'Install command' },
    plugin: { label: 'Plugins', snippetLabel: 'Install command' },
    mcp: { label: 'MCP', snippetLabel: 'Configuration' },
  },
  copy: {
    idle: 'Copy',
    done: 'Copied',
    failed: 'Failed',
    /** Accessible name: the visible label alone repeats across every card. */
    ariaLabel: (name: string) => `Copy the contents of ${name}`,
    unavailable: 'Automatic copying is unavailable here. Select the text to copy it by hand.',
  },
  card: {
    linkLabel: 'Documentation',
  },
  grid: {
    emptyState: 'No tools published yet.',
    emptyFilteredState: 'No tools of this type yet.',
  },
}

type ToolsContent = typeof en

const fr: ToolsContent = {
  metadata: {
    title: 'Outils IA',
    description: 'Les skills, plugins et serveurs MCP que j’utilise au quotidien, prêts à copier.',
  },
  heading: {
    eyebrow: 'Outils IA',
    title: 'Mes skills, plugins et MCP, prêts à copier.',
    lead: 'Ce que j’installe sur mes propres postes. Chaque carte porte sa commande ou sa configuration : un clic sur « Copier » et c’est dans ton presse-papier.',
  },
  filter: {
    allKinds: 'Tous',
    ariaLabel: 'Filtrer par type d’outil',
  },
  kinds: {
    skill: { label: 'Skills', snippetLabel: 'Commande d’installation' },
    plugin: { label: 'Plugins', snippetLabel: 'Commande d’installation' },
    mcp: { label: 'MCP', snippetLabel: 'Configuration' },
  },
  copy: {
    idle: 'Copier',
    done: 'Copié',
    failed: 'Échec',
    ariaLabel: (name: string) => `Copier le contenu de ${name}`,
    unavailable:
      'La copie automatique est indisponible ici. Sélectionne le texte pour le copier à la main.',
  },
  card: {
    linkLabel: 'Documentation',
  },
  grid: {
    emptyState: 'Aucun outil publié pour l’instant.',
    emptyFilteredState: 'Aucun outil de ce type pour l’instant.',
  },
}

const OUTILS_IA_CONTENT: Record<Locale, ToolsContent> = { en, fr }

export function getToolsContent(locale: Locale): ToolsContent {
  return OUTILS_IA_CONTENT[locale]
}
