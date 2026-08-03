---
name: feature
description: Creates a GitHub issue then a feature branch from develop with the issue number. Usage: /feature <name> — e.g. /feature user-auth
allowed-tools: Bash, mcp__github__create_issue
---

The user wants to start a new feature. Args are the branch name (without the `feature/` prefix).

If no args provided, ask the user for the branch name.

Read `docs/MEMORY.md` to get owner and repo (format: `owner/repo`).

Execute in order:

1. **Create the GitHub issue**
   - Ask: "Describe the feature in one sentence (for the GitHub issue)"
   - Derive labels from the branch name:
     - `*phase-1*` → `["type: feature", "phase: 1"]`
     - `*phase-2*` → `["type: feature", "phase: 2"]`
     - `*phase-3*` → `["type: feature", "phase: 3"]`
     - Otherwise → `["type: feature"]`
   - Create the issue via mcp**github**create_issue:
     - owner and repo read from MEMORY.md
     - title: "feat: <description>"
     - labels as derived above
     - assignees: [owner from MEMORY.md]
   - Note the created issue number → `<number>`

2. **Add the issue to the Scrum Board** (if PROJECT_ID is set in MEMORY.md)

   ```bash
   ISSUE_NODE_ID=$(gh api repos/<owner>/<repo>/issues/<number> --jq '.node_id')
   gh api graphql -f query='mutation { addProjectV2ItemById(input: { projectId: "<PROJECT_ID>" contentId: "'$ISSUE_NODE_ID'" }) { item { id } } }'
   ```

3. **Update develop**

   ```bash
   git checkout develop && git pull origin develop
   ```

4. **Create the branch with the issue number**

   ```bash
   git checkout -b feature/<number>-<args>
   ```

5. **Confirm to the user:**

   ```
   ✅ Issue #<number> created — assigned to <owner>
   ✅ Branch 'feature/<number>-<args>' created from develop

   Workflow:
   1. Code, commit with: git commit -m "feat(<scope>): <description>"
   2. When ready: /pr to push and open the PR → develop (Closes #<number>)

   Commit types: feat | fix | chore | docs | refactor | test
   No Co-Authored-By Claude
   ```
