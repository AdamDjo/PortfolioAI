# Adem Portfolio

Portfolio frontend construit sur la template [`AdamDjo/claude-stack`](https://github.com/AdamDjo/claude-stack).

## Stack

- Next.js 15 et React 19 dans `apps/frontend`
- Express dans `apps/backend`
- TypeScript strict partagé via `packages/shared`
- Turborepo et pnpm workspaces

## Démarrage

```bash
bash scripts/setup.sh
pnpm dev
```

Le frontend est disponible sur `http://localhost:3000` et le backend sur `http://localhost:3001` lorsque les deux applications sont lancées ensemble.

## Commandes

```bash
pnpm type-check
pnpm lint
pnpm test
pnpm build
```

Le panneau `/admin` et la collection `/liens` sont des démonstrations frontend. Aucun stockage ni système d’authentification n’est actif dans cette première version.
