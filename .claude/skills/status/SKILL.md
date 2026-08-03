---
name: status
description: Show current project progress, active phase, and what needs to be done next.
disable-model-invocation: true
allowed-tools: Read, Glob, Bash
---

Show the current project status:

1. Read `docs/MEMORY.md` for project state and current phase
2. Check git status for uncommitted changes
3. Check recent git log for context
4. Present a clean summary:

Format:

```
PROJECT: <name>
================================
Current phase: Phase <X> — <description>
Branch: <current-branch>
Status: <clean / X uncommitted changes>

NEXT TASKS:
- [ ] Task 1
- [ ] Task 2

RECENT COMMITS:
<last 5 commits>
```

5. Report any blockers found in MEMORY.md
