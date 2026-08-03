---
name: hotfix
description: Creates a GitHub issue then a hotfix branch from main with the issue number. Usage: /hotfix <name> — e.g. /hotfix auth-crash
allowed-tools: Bash, mcp__github__create_issue
---

The user wants to fix an urgent production bug. Args are the hotfix name (without the `hotfix/` prefix).

Read `docs/MEMORY.md` to get owner and repo.

Execute in order:

1. **Create the GitHub issue**
   - Ask: "Describe the production issue in one sentence"
   - Create the issue via mcp**github**create_issue:
     - owner and repo read from MEMORY.md
     - title: "hotfix: <description>"
     - labels: ["type: bug", "priority: high"]
     - assignees: [owner]
   - Note the issue number → `<number>`

2. **Start from main — not develop (this is urgent)**

   ```bash
   git checkout main && git pull origin main
   ```

3. **Create the hotfix branch**

   ```bash
   git checkout -b hotfix/<number>-<args>
   ```

4. **Confirm:**

   ```
   ⚠️  HOTFIX — branching from main (production)

   ✅ Issue #<number> created
   ✅ Branch 'hotfix/<number>-<args>' created from main

   1. Fix the bug, commit with: git commit -m "fix(<scope>): <description>"
   2. When ready: /pr to push and open the PR → main (Closes #<number>)
   3. After merge into main: /sync to bring the fix into develop
   ```
