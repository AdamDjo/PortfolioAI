# Project memory — Adem Portfolio

## Repository

- GitHub : `AdamDjo/PortfolioAI`
- GitHub Project : `Scrum Board` (`AdamDjo`, projet #5)
- Project ID : `PVT_kwHOAacnj84BU6rS`
- Visibilité : publique
- Branches d'intégration : `main` et `develop`

## Current state

- Migration de Vite vers la template `AdamDjo/claude-stack` terminée.
- Monorepo Next.js 16 + Payload 3 + packages partagés.
- Scope npm renommé de `@starter/*` vers `@portfolio/*`.
- Pages publiques, collection de liens et dashboard de démonstration implémentés.
- Deux assets hero dédiés : `hero-brain-light.png` et `hero-brain-dark.png`.
- Payload CMS monté dans Next.js (issue #2) : admin sur `/admin`, API sur `/api/*`.
- Le backend Express a été supprimé ; `apps/frontend` est la seule application.
- Liens de veille servis par Payload (issue #6) : collections `bookmarks` et `tags`,
  `/veille` rendu côté serveur, ajout réservé au propriétaire connecté.

## Confirmed direction

- PostgreSQL : Supabase en démo, puis auto-hébergé avec Docker sur le VPS en production.
  Les deux passent par la même variable `DATABASE_URI`.
- Coolify pilotera les déploiements, les domaines et les sauvegardes.
- La spécification fonctionnelle de référence est `docs/FEATURE_SPEC_CMS_AI.md`.
- Les collections métier arrivent par lots : `users` + `media` en #2, `projects`,
  `bookmarks` et `tags` en #6.
- Le visiteur ne publie jamais de lien. L'écriture est réservée au propriétaire
  connecté, pour que personne ne puisse polluer la grille de veille.
- L'ajout d'un lien doit rester possible depuis un téléphone, sur la page publique,
  sans ouvrir `/admin` : c'est la raison d'être du champ d'ajout dans `/veille`.
- Un lien se saisit par son URL seule, jamais en téléversant une image.

## Product boundaries

- `/demo` est une démonstration visuelle, pas un back-office connecté.
- `/admin` est le véritable back-office, servi par Payload.
- Le formulaire de contact ne transmet aucune donnée en phase 1.

## Implementation notes

- `apps/frontend` est en ESM (`"type": "module"`), requis par le chargement de la
  config Payload. C'est pour cette raison que `eslint.config.js` a été renommé
  en `eslint.config.cjs` (il utilise `require`).
- Les fichiers générés par la CLI Payload (`src/app/(payload)/**`,
  `src/payload-types.ts`) sont exclus du lint : toute correction manuelle serait
  écrasée à la prochaine génération. Les migrations restent lintées.
- `push: false` dans `payload.config.ts` : le schéma évolue uniquement par
  migrations, pour que démo et production ne divergent jamais.
- Supabase doit être utilisé en mode « Session » (port 5432). Le mode
  « Transaction » (6543) casse les migrations Payload.
- Next 16 a supprimé la clé `eslint` de `NextConfig` ; elle a été retirée de
  `next.config.ts`.
- La CLI Payload (`migrate:create`) exige un TTY. Depuis un agent, l'envelopper :
  `script -q /dev/null pnpm --filter @portfolio/frontend migrate:create`.
- Le hook d'aperçu Open Graph est partagé entre `projects` et `bookmarks`
  (`src/lib/open-graph-hook.ts`), paramétré par les noms de champs.
- Toute URL est canonicalisée avant enregistrement (`src/lib/canonical-url.ts`),
  sinon l'index unique sur `url` laisserait passer des doublons.
- Prettier et ESLint doivent être lancés depuis le workspace
  (`pnpm --filter @portfolio/frontend exec …`), pas depuis la racine.
- Un écran `500` sur toutes les routes `/api/*` et `/admin` après plusieurs
  modifications vient en général du cache `.next` périmé, pas du code :
  arrêter le serveur, `rm -rf apps/frontend/.next`, redémarrer.

## Validation

- `pnpm type-check`
- `pnpm lint`
- `pnpm build`
- `pnpm --filter @portfolio/frontend migrate` (nécessite `DATABASE_URI`)
- `pnpm test`
- Vérification navigateur sur `/`, `/liens`, `/demo`, `/veille` et `/admin`.
- Contrôle d'accès vérifié à l'API, seule vraie barrière : `GET /api/bookmarks`
  répond `200`, tandis que `POST`/`DELETE` sans session répondent `403`.
