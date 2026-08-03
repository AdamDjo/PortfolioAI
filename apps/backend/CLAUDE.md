# Backend Agent Instructions

## Scope

This agent works ONLY on `apps/backend/`. Never modify files outside this directory except `packages/shared/` when new types are needed.

## Architecture

- Express + TypeScript API server on port 3001
- Supabase for database, auth, and storage
- All business logic lives here
- Validate everything — never trust client data

## Directory Structure

```
src/
├── config/         # Environment & Supabase config
├── middleware/      # Express middlewares (auth, error, validation)
├── routes/         # Thin controllers (delegate to services)
├── services/       # Business logic
└── lib/            # Utilities
```

## Rules

- Always validate inputs with zod schemas
- All responses: `{ success: boolean, data?: T, error?: string }`
- Import types ONLY from `@portfolio/shared`, never duplicate
- Use `async/await`, never `.then()`
- Files: `kebab-case.ts` (e.g., `user.service.ts`)
- Named exports only, no default exports
- Never trust client data — validate everything server-side

## Key Dependencies

- `@portfolio/shared` — All shared types
- `@supabase/supabase-js` — Database & auth
- `zod` — Input validation
- `express-rate-limit` — Rate limiting

## Testing

- Run `pnpm type-check --filter backend` to verify types
- Run `pnpm dev --filter backend` to test the server starts
