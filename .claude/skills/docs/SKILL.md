---
name: docs
description: Updates docs/MEMORY.md and docs/ARCHITECTURE.md by reading the current state of the code. Usage: /docs
allowed-tools: Read, Edit, Glob, Bash
---

Updates the project's persistent documentation by reading the actual current state of the code.

Execute in order:

1. **Read current state**

   ```bash
   git log --oneline -10
   git branch -a
   git status --short
   ```

   Also read:
   - `docs/MEMORY.md` (current version)
   - `docs/ARCHITECTURE.md` (current version)
   - `packages/shared/src/index.ts` (exported types)
   - `apps/backend/src/index.ts` (registered routes)
   - `apps/frontend/src/app/` (existing pages)

2. **Update `docs/MEMORY.md`**

   Sections to update:
   - **Quick Summary**: current branch, current phase
   - **Project State**: list of implemented vs planned features
   - **Timeline**: add recent events (merged features, releases)
   - **Next Steps**: what remains to do in the current phase

   Do not overwrite "Key Decisions" and "User Preferences" sections unless the user asks.

3. **Update `docs/ARCHITECTURE.md`**

   Sections to update:
   - **Data Model**: actual types from `packages/shared/src/types/`
   - **API Design**: actual routes from `apps/backend/src/routes/`
   - **Folder Structure**: actual folder structure created

4. **Confirm:**

   ```
   ✅ docs/MEMORY.md updated
   ✅ docs/ARCHITECTURE.md updated

   Summary of changes:
   - <what changed in MEMORY.md>
   - <what changed in ARCHITECTURE.md>
   ```
