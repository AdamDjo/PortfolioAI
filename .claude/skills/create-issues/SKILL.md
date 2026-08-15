---
name: create-issues
description: Creates GitHub issues from a specification or document. Usage: /create-issues <source> — e.g. /create-issues docs/PRODUCT_DESIGN.md
allowed-tools: Read, Bash, mcp__github__create_issue
---

The user wants to create GitHub issues from a document or description.

Read `docs/MEMORY.md` to get owner and repo.

Execute in order:

1. **Read the source**
   - If a file is passed as argument (e.g. `docs/PRODUCT_DESIGN.md`), read it
   - Otherwise ask: "Describe the tasks to create as issues (list or document)"

2. **Identify tasks to create**
   - Extract distinct tasks
   - Infer phase, domain, and priority for each task

3. **For each task, create an issue via mcp**github**create_issue:**
   - owner and repo read from MEMORY.md
   - title: "feat: <description>"
   - labels: based on phase and domain
   - assignees: [owner]

4. **If PROJECT_ID is set in MEMORY.md, add issues to the Scrum Board:**

   ```bash
   ISSUE_NODE_ID=$(gh api repos/<owner>/<repo>/issues/<number> --jq '.node_id')
   gh api graphql -f query='mutation { addProjectV2ItemById(input: { projectId: "<PROJECT_ID>" contentId: "'$ISSUE_NODE_ID'" }) { item { id } } }'
   ```

5. **Confirm with the list of created issues and their numbers**
