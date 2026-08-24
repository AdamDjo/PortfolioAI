# PortfolioAI

Mon portfolio personnel, construit comme un outil plutôt que comme une vitrine : le site public est la façade, mais l'essentiel est derrière — un CMS auto-hébergé où je centralise ma veille technique, mes projets, mes expériences et une base de connaissances qui alimente un assistant IA.

Le code est ouvert à la lecture. Il n'est pas ouvert à la revente — voir [Licence](#licence).

## Ce que fait le projet

- **Portfolio public** — accueil, à propos, projets, veille, contact.
- **CMS intégré** — Payload 3 monté dans la même application Next.js, sans backend séparé.
- **Veille structurée** — les liens sont enregistrés, taggés et publiés depuis l'admin.
- **Assistant IA** — une base de connaissances éditoriale répond aux questions sur mon parcours.
- **Formulaire de contact** — envoi transactionnel via Lumail.

## Stack

| Domaine         | Choix                                                    |
| --------------- | -------------------------------------------------------- |
| Framework       | Next.js 16 (App Router) + React 19                       |
| CMS             | Payload 3, monté dans l'app Next.js                      |
| Base de données | PostgreSQL via `@payloadcms/db-postgres`                 |
| Langage         | TypeScript strict, types partagés dans `packages/shared` |
| Monorepo        | Turborepo + pnpm workspaces                              |
| Tests           | Vitest (unitaires) + Playwright (e2e)                    |
| Qualité         | ESLint, Prettier, commitlint, Husky, Knip                |

## Structure

```
apps/frontend/          Next.js + Payload (site public, admin, API)
  src/app/(site)/       routes publiques
  src/app/(payload)/    admin et API Payload
  src/cms/              collections, migrations, config
packages/shared/        types et constantes partagés
packages/eslint-config/ configuration ESLint commune
packages/prettier-config/ configuration Prettier commune
```

### Collections Payload

`projects`, `experiences`, `bookmarks`, `tags`, `ai-knowledge`, `media`, `users`.

### Routes publiques

`/` · `/a-propos` · `/projets` · `/veille` · `/contact` · `/mentions-legales`

L'administration Payload est sur `/admin`. Le premier compte se crée directement depuis cet écran.

## Démarrage

Prérequis : Node 20+, pnpm 9 (voir `packageManager` dans `package.json`), et une base PostgreSQL accessible.

```bash
bash scripts/setup.sh
```

Renseignez ensuite `apps/frontend/.env.local` à partir de `.env.example`. Deux variables sont indispensables :

- `PAYLOAD_SECRET` — généré avec `openssl rand -base64 32`
- `DATABASE_URI` — chaîne de connexion PostgreSQL

Les autres (`GROQ_API_KEY`, `LUMAIL_*`) sont optionnelles : sans elles, l'assistant et le formulaire de contact se dégradent proprement au lieu d'échouer.

Une base locale est disponible via Docker :

```bash
docker compose -f docker-compose.dev.yml up -d
```

Appliquez les migrations, puis démarrez :

```bash
pnpm --filter @portfolio/frontend migrate
pnpm dev
```

Le site est sur `http://localhost:3000`, l'admin sur `http://localhost:3000/admin`.

## Commandes

```bash
pnpm dev
pnpm build
pnpm lint
pnpm type-check
pnpm test
pnpm test:e2e
```

### Migrations Payload

```bash
pnpm --filter @portfolio/frontend migrate:create
pnpm --filter @portfolio/frontend migrate
pnpm --filter @portfolio/frontend migrate:status
```

Le schéma évolue **uniquement** par migrations — `push` est désactivé, pour que la démo et la production ne divergent jamais.

## Licence

Ce projet est **source-available**, pas open source.

**Autorisé** — lire le code, l'exécuter localement, l'étudier, le modifier pour un usage personnel ou pédagogique, et en réutiliser des morceaux dans vos propres projets.

**Interdit** — le revendre, le redistribuer comme template ou starter kit, ou le proposer comme service hébergé.

Les détails sont dans [LICENSE](LICENSE). Les versions publiées avant ce changement restent sous licence MIT.

Une question sur un usage particulier ? Ouvrez une issue, on en discute.

## Soutenir le projet

Si ce dépôt vous a fait gagner du temps ou appris quelque chose, vous pouvez soutenir le travail :

- [GitHub Sponsors](https://github.com/sponsors/AdamDjo)
- [Buy Me a Coffee](https://www.buymeacoffee.com/adamdjo)

Vous voulez de l'aide pour le déployer chez vous ? Écrivez-moi, c'est le genre de chose que je fais volontiers.

## Contribuer

Les issues et PRs sont bienvenues — voir [CONTRIBUTING.md](CONTRIBUTING.md). Pour les vulnérabilités, suivez [SECURITY.md](SECURITY.md) plutôt que d'ouvrir une issue publique.
