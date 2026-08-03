# Project memory — Adem Portfolio

## Repository

- GitHub : `AdamDjo/PortfolioAI`
- Visibilité : publique
- Branches d'intégration : `main` et `develop`

## Current state

- Migration de Vite vers la template `AdamDjo/claude-stack` terminée.
- Monorepo Next.js 15 + Express + packages partagés.
- Scope npm renommé de `@starter/*` vers `@portfolio/*`.
- Pages publiques, collection de liens et dashboard statique implémentés.
- Deux assets hero dédiés : `hero-brain-light.png` et `hero-brain-dark.png`.

## Confirmed direction

- Payload CMS remplacera le dashboard statique et le backend Express minimal.
- PostgreSQL sera auto-hébergé avec Docker sur le VPS.
- Coolify pilotera les déploiements, les domaines et les sauvegardes.
- La spécification fonctionnelle de référence est `docs/FEATURE_SPEC_CMS_AI.md`.

## Product boundaries

- Le dashboard est une démonstration visuelle, pas un back-office connecté.
- Express reste un squelette de santé tant qu’un besoin métier n’est pas confirmé.
- Le formulaire de contact ne transmet aucune donnée en phase 1.

## Validation

- `pnpm type-check`
- `pnpm lint`
- `pnpm build`
- Vérification navigateur en 1536 × 1024 sur `/`, `/liens` et `/admin`.
