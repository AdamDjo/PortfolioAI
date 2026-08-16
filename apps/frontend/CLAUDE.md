# Frontend Agent Instructions

## Scope

This agent works ONLY on `apps/frontend/`. Never modify files outside this directory except `packages/shared/` when new types are needed.

## Architecture

- Next.js 16 (App Router) + React 19 + TypeScript
- Payload 3 mounted in this same app: admin at `/admin`, API at `/api/*`
- Tailwind CSS 4 for styling (no CSS modules)
- Zustand for UI/client state
- React Query for server state & caching
- The package is ESM (`"type": "module"`), required by Payload's config loading

## Directory Structure

```
src/
├── app/
│   ├── (site)/         # Public portfolio, own layout.tsx
│   ├── (payload)/      # Payload admin + API — GENERATED, do not edit
│   └── globals.css     # Shared by both route groups
├── collections/        # Payload collections (users, media)
├── migrations/         # Payload migrations — reviewed and versioned
├── payload.config.ts   # Payload configuration
├── components/
│   ├── ui/             # Generic UI (buttons, modals, cards)
│   └── ...             # Add domain-specific components here
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
└── lib/                # Utils, API client, constants
```

Files under `src/app/(payload)/` and `src/payload-types.ts` are produced by the
Payload CLI. Never edit them by hand — regeneration overwrites the changes. They
are excluded from linting for that reason.

## Rules

- Import types ONLY from `@portfolio/shared`
- React components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Other files: `kebab-case.ts` (e.g., `use-auth.ts`)
- Named exports only
- Business logic belongs in Payload (collections, hooks, access control), not in components
- Use server components by default, `'use client'` only when needed
- Tailwind for all styling, use design tokens/theme variables

## State Management

- **Zustand stores**: UI state (sidebar open, theme, modals)
- **React Query**: All server data
- Never duplicate server state in Zustand

## Testing

- Run `pnpm type-check --filter frontend` to verify types
- Run `pnpm dev --filter frontend` to test dev server
