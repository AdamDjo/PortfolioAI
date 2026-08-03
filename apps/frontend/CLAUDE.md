# Frontend Agent Instructions

## Scope

This agent works ONLY on `apps/frontend/`. Never modify files outside this directory except `packages/shared/` when new types are needed.

## Architecture

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 for styling (no CSS modules)
- Zustand for UI/client state
- React Query for server state & caching
- All API calls proxied through `/api/[...path]/route.ts`
- Frontend is display-only: shows data, presents options, displays state

## Directory Structure

```
src/
├── app/
│   ├── api/            # Proxy route to backend
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Landing/redirect
├── components/
│   ├── ui/             # Generic UI (buttons, modals, cards)
│   └── ...             # Add domain-specific components here
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
└── lib/                # Utils, API client, constants
```

## Rules

- Import types ONLY from `@portfolio/shared`
- React components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Other files: `kebab-case.ts` (e.g., `use-auth.ts`)
- Named exports only
- Never put business logic in frontend — it belongs in the backend
- Use server components by default, `'use client'` only when needed
- Tailwind for all styling, use design tokens/theme variables

## State Management

- **Zustand stores**: UI state (sidebar open, theme, modals)
- **React Query**: All server data
- Never duplicate server state in Zustand

## Testing

- Run `pnpm type-check --filter frontend` to verify types
- Run `pnpm dev --filter frontend` to test dev server
