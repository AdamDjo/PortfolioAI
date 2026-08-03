---
name: new-project
description: Initialize a new project from this template. Asks questions about your project and configures everything automatically.
allowed-tools: Read, Edit, Write, Bash, mcp__github__create_issue, mcp__github__create_branch
---

Trigger the project-setup agent to initialize this template for a new project.

The setup agent will:

1. Ask you about your project (name, description, stack)
2. Generate docs/PRODUCT_DESIGN.md and docs/ARCHITECTURE.md
3. Rename the @starter/\* npm scope to your scope
4. Create GitHub milestones and Phase 1 issues
5. Set up the develop branch

This is equivalent to running: "go new-project"
