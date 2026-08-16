# Architecture — Adem Portfolio

## Tech stack

| Layer    | Technology                             | Decision rationale                                                          |
| -------- | -------------------------------------- | --------------------------------------------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript       | App Router, rendu statique, métadonnées et images optimisées                |
| Styling  | Tailwind CSS 4 + CSS tokens            | Conserve la template tout en permettant une direction visuelle précise      |
| CMS      | Payload 3 (monté dans Next.js)         | Admin et API dans la même application : un seul déploiement, types partagés |
| Data     | PostgreSQL (`@payloadcms/db-postgres`) | Supabase en démo, PostgreSQL auto-hébergé sur le VPS en production          |
| Monorepo | Turborepo + pnpm                       | Partage de types et commandes cohérentes                                    |

## Applications

- `apps/frontend`: portfolio public, collection de liens, admin Payload et API Payload.
- `packages/shared`: contrats TypeScript partagés.

Le service Express a été retiré : Payload fournit l'API REST et GraphQL, et tourne
dans le même processus Next.js.

## Route groups

Le routeur est découpé en deux groupes, qui n'ajoutent aucun segment d'URL :

- `src/app/(site)/` — le portfolio public, avec son propre `layout.tsx`.
- `src/app/(payload)/` — l'admin et l'API Payload, avec le layout racine fourni
  par Payload. Ces fichiers sont générés par la CLI et ne doivent pas être
  modifiés à la main (ils sont exclus du lint pour cette raison).

`globals.css` reste à la racine de `src/app/`, partagé par les deux groupes.

## Frontend routes

| Route          | Purpose                                        |
| -------------- | ---------------------------------------------- |
| `/`            | Hero conversationnelle et sélection de projets |
| `/projets`     | Liste des projets                              |
| `/veille`      | Articles et notes techniques                   |
| `/a-propos`    | Parcours et principes                          |
| `/contact`     | Formulaire local prêt à connecter              |
| `/liens`       | Démonstration du gestionnaire de favoris       |
| `/demo`        | Démonstration du panneau d'administration      |
| `/admin`       | Administration Payload                         |
| `/api/*`       | API REST Payload                               |
| `/api/graphql` | API GraphQL Payload                            |

## Collections

- `users` — collection d'authentification, propriétaire de l'accès à `/admin`.
- `media` — uploads, lecture publique, écriture réservée aux utilisateurs connectés.

Les collections métier (projets, liens, tags) arriveront dans des lots suivants.

## Base de données

Une seule variable, `DATABASE_URI`, pilote les deux environnements :

- **Démo** — Supabase, en mode « Session » (port 5432). Le mode « Transaction »
  (port 6543) ne supporte pas les migrations Payload.
- **Production** — PostgreSQL auto-hébergé sur le VPS, décrit dans `docker-compose.yml`.

`push` est désactivé dans `payload.config.ts` : le schéma évolue uniquement par
migrations, pour que la démo et la production ne divergent jamais.

```bash
pnpm --filter @portfolio/frontend migrate:create
pnpm --filter @portfolio/frontend migrate
```

## Key decisions

- Les routes marketing restent statiques.
- Le schéma de base est piloté par les migrations, jamais par `push`.
- Les assets cerveau clair et sombre sont distincts pour préserver lumière, matière et contraste.
