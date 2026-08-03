---
name: pr
description: Pushes the current branch and opens a PR toward the correct target. Extracts the issue number from the branch name automatically.
allowed-tools: Bash, mcp__github__create_pull_request
---

The user wants to push their current branch and open a PR.

Read `docs/MEMORY.md` to get owner and repo.

Execute in order:

1. **Gather context**

   ```bash
   git rev-parse --abbrev-ref HEAD
   git log origin/develop..HEAD --oneline 2>/dev/null || git log origin/main..HEAD --oneline
   git status --short
   ```

2. **Check for uncommitted files** — if any, warn the user before continuing

3. **Determine target branch by prefix:**
   - `feature/*` → target: `develop`
   - `fix/*` → target: `develop`
   - `chore/*` → target: `develop`
   - `hotfix/*` → target: `main`
   - `release/*` → target: `main`

4. **Extract the issue number from the branch name**
   - Pattern: `<prefix>/<number>-<description>`
   - If no number detected, ask the user: "Is there an issue number to close? (or press Enter to skip)"

5. **Push the branch**

   ```bash
   git push origin <current-branch>
   ```

6. **Prepare the PR title and body**

   Body:

   ```
   ## Summary
   <list of main changes>

   ## Test plan
   - [ ] lint + type-check pass
   - [ ] Unit tests pass
   - [ ] Tested locally

   Closes #<issue number>
   ```

7. **Determine labels:**
   - `feature/*phase-1*` → `["phase: 1", "domain: frontend"]` or `domain: backend`
   - `feature/*phase-2*` → `["phase: 2"]`
   - `feature/*phase-3*` → `["phase: 3"]`
   - `fix/*` → `["type: bug"]`
   - `hotfix/*` → `["type: bug", "priority: high"]`
   - `chore/*` → `["type: chore"]`
   - `release/*` → `["type: release"]`
   - Add `domain: devops` if files changed in `.github/`
   - Add `domain: shared` if files changed in `packages/`

8. **Create the PR via mcp**github**create_pull_request**
   - owner and repo read from MEMORY.md
   - assignees: [owner]
   - reviewers: [owner]

9. **Assign the PR to the Scrum Board and milestone** (if PROJECT_ID is set in MEMORY.md)

   ```bash
   PR_NODE_ID=$(gh api repos/<owner>/<repo>/pulls/<PR_NUMBER> --jq '.node_id')
   gh api graphql -f query='mutation { addProjectV2ItemById(input: { projectId: "<PROJECT_ID>" contentId: "'$PR_NODE_ID'" }) { item { id } } }'

   MILESTONE_NUMBER=$(gh api repos/<owner>/<repo>/milestones --jq '.[] | select(.title == "<MILESTONE_TITLE>") | .number')
   gh api repos/<owner>/<repo>/issues/<PR_NUMBER> --method PATCH --field milestone=$MILESTONE_NUMBER
   ```

10. **Confirm to the user with the PR URL**
    - Show: assignee ✅, reviewer ✅, project ✅, milestone ✅ (or "no milestone for this branch")
