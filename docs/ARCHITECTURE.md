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

Les migrations sont versionnées : elles sont la seule description reproductible du
schéma. Les fichiers téléversés, eux, sont des données et restent hors du dépôt
(`apps/frontend/media/` est ignoré par Git). En production, ce dossier doit être
un volume persistant, sinon les médias disparaissent à chaque redéploiement.

## Sécurité des accès

Les permissions vivent dans les fonctions `access` des collections Payload, donc
côté serveur : `users` exige une session pour toute opération, `media` autorise la
lecture publique mais réserve l'écriture aux utilisateurs connectés.

Le RLS (Row Level Security) de PostgreSQL est **volontairement désactivé**. Il
protège le cas où le navigateur interroge Postgres directement via la clé publique
Supabase — ce que cette application ne fait jamais : le SDK `@supabase/supabase-js`
a été retiré, et le seul accès à la base est `DATABASE_URI`, côté serveur, derrière
les règles Payload. Activer le RLS ajouterait une seconde couche de permissions,
écrite en SQL et ignorante des utilisateurs Payload.

Cette décision devra être revue si le navigateur accède un jour directement à
Supabase (Auth, Storage ou Realtime) : dans ce cas le RLS redevient indispensable.

## Key decisions

- Les routes marketing restent statiques.
- Le schéma de base est piloté par les migrations, jamais par `push`.
- Les assets cerveau clair et sombre sont distincts pour préserver lumière, matière et contraste.
