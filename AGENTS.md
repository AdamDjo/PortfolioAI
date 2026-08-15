# PortfolioAI — Local Agent Rules

These rules extend `~/.codex/AGENTS.md` and apply to this repository.

## GitHub Delivery

- Adem is the only person allowed to merge pull requests.
- Agents must never run `gh pr merge`, call a GitHub merge API, merge a feature branch into `develop` or `main`, or close the linked issue as completed before Adem merges.
- Feature, fix, and chore pull requests target `develop`.
- Hotfix and release pull requests target `main`.
- The agent may monitor CI, report failures, and push fixes to the PR branch, but must stop once the PR is ready for manual review.

## Required Pull Request Metadata

Repository project: `AdamDjo` → `Scrum Board` (`#5`).

Before reporting a pull request as ready, verify all of the following with the GitHub CLI:

- linked issue through `Closes #<number>`;
- assignee: `AdamDjo`;
- applicable type, domain, priority, and phase labels;
- milestone matching the issue phase or release;
- pull request added to the repository GitHub Project;
- complete title, summary, test plan, and validation results;
- CI status reported without merging.

If GitHub CLI lacks the `read:project` or `project` scopes, or if no project or milestone can be resolved, stop and tell Adem exactly which permission or choice is missing. Never silently omit required metadata.
