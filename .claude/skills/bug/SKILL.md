---
name: bug
description: Creates a GitHub issue then a fix branch from develop with the issue number. Usage: /bug <name> — e.g. /bug login-crash
allowed-tools: Bash, mcp__github__create_issue
---

The user wants to fix a bug. Args are the branch name (without the `fix/` prefix).

If no args provided, ask for the name and description of the bug.

Read `docs/MEMORY.md` to get owner and repo.

Execute in order:

1. **Create the GitHub issue**
   - Ask: "Describe the bug in one sentence (for the GitHub issue)"
   - Create the issue via mcp**github**create_issue:
     - owner and repo read from MEMORY.md
     - title: "fix: <bug description>"
     - labels: ["type: bug"]
     - assignees: [owner]
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
   git checkout -b fix/<number>-<args>
   ```

5. **Confirm to the user:**

   ```
   ✅ Issue #<number> created
   ✅ Branch 'fix/<number>-<args>' created from develop

   1. Fix the bug, commit with: git commit -m "fix(<scope>): <description>"
   2. When ready: /pr to push and open the PR → develop (Closes #<number>)
   ```
