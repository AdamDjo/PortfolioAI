# Architecture — Adem Portfolio

## Tech stack

| Layer    | Technology                       | Decision rationale                                                               |
| -------- | -------------------------------- | -------------------------------------------------------------------------------- |
| Frontend | Next.js 15, React 19, TypeScript | App Router, rendu statique, métadonnées et images optimisées                     |
| Styling  | Tailwind CSS 4 + CSS tokens      | Conserve la template tout en permettant une direction visuelle précise           |
| Backend  | Express                          | Squelette minimal compatible avec la template, sans complexité Adonis prématurée |
| Data     | TypeScript local                 | Aucun besoin de persistance pour la première version                             |
| Monorepo | Turborepo + pnpm                 | Partage de types et commandes cohérentes                                         |

## Applications

- `apps/frontend`: portfolio public, collection de liens et dashboard de démonstration.
- `apps/backend`: service Express minimal avec `GET /api/health`.
- `packages/shared`: contrats TypeScript partagés entre les applications.

## Frontend routes

| Route       | Purpose                                        |
| ----------- | ---------------------------------------------- |
| `/`         | Hero conversationnelle et sélection de projets |
| `/projets`  | Liste des projets                              |
| `/veille`   | Articles et notes techniques                   |
| `/a-propos` | Parcours et principes                          |
| `/contact`  | Formulaire local prêt à connecter              |
| `/liens`    | Démonstration du gestionnaire de favoris       |
| `/admin`    | Démonstration du panneau d’administration      |

## Key decisions

- Les routes marketing restent statiques.
- Les données ne quittent pas le navigateur en phase 1.
- Le backend ne contient aucune logique métier fictive.
- Les assets cerveau clair et sombre sont distincts pour préserver lumière, matière et contraste.
