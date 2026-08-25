/**
 * Static editorial copy and metadata for the AI tooling page.
 *
 * The tools themselves come from Payload — this file only holds strings tied to
 * the page's structure.
 */
export const OUTILS_IA_CONTENT = {
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
  /** Filter labels and the caption above each snippet, per kind. */
  kinds: {
    skill: { label: 'Skills', snippetLabel: 'Commande d’installation' },
    plugin: { label: 'Plugins', snippetLabel: 'Commande d’installation' },
    mcp: { label: 'MCP', snippetLabel: 'Configuration' },
  },
  copy: {
    idle: 'Copier',
    done: 'Copié',
    failed: 'Échec',
    /** Accessible name: the visible label alone repeats across every card. */
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
} as const
