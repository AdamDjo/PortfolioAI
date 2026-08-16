# Adem Portfolio

Portfolio frontend construit sur la template [`AdamDjo/claude-stack`](https://github.com/AdamDjo/claude-stack).

## Stack

- Next.js 16 et React 19 dans `apps/frontend`
- Payload 3 monté dans la même application Next.js (admin et API)
- PostgreSQL via `@payloadcms/db-postgres`
- TypeScript strict partagé via `packages/shared`
- Turborepo et pnpm workspaces

## Démarrage

```bash
bash scripts/setup.sh
```

Renseignez ensuite `apps/frontend/.env.local` à partir de `.env.example` :
`PAYLOAD_SECRET` (généré avec `openssl rand -base64 32`) et `DATABASE_URI`.

```bash
pnpm --filter @portfolio/frontend migrate
pnpm dev
```

L'application est disponible sur `http://localhost:3000`, et l'administration
Payload sur `http://localhost:3000/admin`. Le premier compte se crée directement
depuis cet écran.

## Commandes

```bash
pnpm type-check
pnpm lint
pnpm test
pnpm build
```

### Migrations Payload

```bash
pnpm --filter @portfolio/frontend migrate:create
pnpm --filter @portfolio/frontend migrate
pnpm --filter @portfolio/frontend migrate:status
```

Le schéma évolue uniquement par migrations (`push` est désactivé), afin que la
démo et la production ne divergent jamais.

## Routes

`/admin` est l'administration Payload. `/demo` et `/liens` restent des
démonstrations frontend sans stockage.
