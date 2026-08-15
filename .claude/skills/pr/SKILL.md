---
name: pr
description: Pushes the current branch and opens a fully configured PR toward the correct target. Never merges it.
allowed-tools: Bash
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

8. **Create the PR with `gh pr create`**
   - owner and repo read from MEMORY.md
   - assign the PR to the owner
   - never assign the owner as their own reviewer
   - never merge the PR, even after CI passes

9. **Assign the PR to the Scrum Board and milestone — mandatory**

   - Reuse the linked issue milestone when available; otherwise select the milestone matching the phase or release.
   - Resolve the repository project with `gh project list --owner <owner>` when `PROJECT_ID` is not recorded in MEMORY.md.
   - If the CLI lacks `read:project` or `project` scope, stop and ask the user to authorize the required scope. Never skip the project silently.

   ```bash
   PR_NODE_ID=$(gh api repos/<owner>/<repo>/pulls/<PR_NUMBER> --jq '.node_id')
   gh api graphql -f query='mutation { addProjectV2ItemById(input: { projectId: "<PROJECT_ID>" contentId: "'$PR_NODE_ID'" }) { item { id } } }'

   MILESTONE_NUMBER=$(gh api repos/<owner>/<repo>/milestones --jq '.[] | select(.title == "<MILESTONE_TITLE>") | .number')
   gh api repos/<owner>/<repo>/issues/<PR_NUMBER> --method PATCH --field milestone=$MILESTONE_NUMBER
   ```

10. **Apply and verify all metadata**
    - Add applicable type, domain, priority, and phase labels.
    - Verify issue link, assignee, labels, milestone, project, title, body, and CI status with `gh`.
    - Missing required metadata is a blocker, not a warning.

11. **Confirm to the user with the PR URL, then stop**
    - Show: issue ✅, assignee ✅, labels ✅, project ✅, milestone ✅, CI status.
    - Explicitly state that the PR is waiting for Adem's manual merge.
    - Do not close the linked issue manually before the merge.
