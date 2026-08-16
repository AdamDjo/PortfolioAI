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

## Confirmed direction

- PostgreSQL : Supabase en démo, puis auto-hébergé avec Docker sur le VPS en production.
  Les deux passent par la même variable `DATABASE_URI`.
- Coolify pilotera les déploiements, les domaines et les sauvegardes.
- La spécification fonctionnelle de référence est `docs/FEATURE_SPEC_CMS_AI.md`.
- Les collections métier (projets, liens, tags) viendront dans des lots suivants ;
  l'issue #2 ne pose que le socle `users` + `media`.

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

## Validation

- `pnpm type-check`
- `pnpm lint`
- `pnpm build`
- `pnpm --filter @portfolio/frontend migrate` (nécessite `DATABASE_URI`)
- Vérification navigateur sur `/`, `/liens`, `/demo` et `/admin`.
