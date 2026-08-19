---
name: release
description: Creates and pushes a release/X.Y.Z branch from develop. Triggers CI + tag + GitHub Release automatically. Usage: /release <version> — e.g. /release 1.2.3
allowed-tools: Bash
---

The user wants to cut a release. Args are the version number (e.g. `1.2.3` or `0.1.0`).

If no args provided, ask for the desired version.

Execute in order:

1. **Validate semver format**
   - Must be X.Y.Z (digits only, no leading `v`)
   - If invalid, show an error and stop

2. **Check develop is clean**

   ```bash
   git status --short
   ```

3. **Update develop**

   ```bash
   git checkout develop && git pull origin develop
   ```

4. **Create and push the release branch**

   ```bash
   git checkout -b release/<version>
   git push origin release/<version>
   ```

5. **Confirm:**

   ```
   ✅ release/<version> created and pushed

   GitHub Actions will automatically:
   1. Run lint + type-check + build
   2. Create tag v<version>
   3. Publish the GitHub Release with auto-generated changelog
   4. Open a PR release/<version> → main

   ⚠️  Merge that PR with "Create a merge commit" — never Squash.
       See "How the release PR must be merged" below.

   After the merge into main, run: /sync
   ```

## How the release PR must be merged

**Merge the `release/*` → `main` pull request with "Create a merge commit". Never
Squash, never Rebase.** Adem performs the merge himself; state the rule when
handing the PR over.

A squash replaces the branch with a brand-new single-parent commit, so nothing on
`main` records that it came from `develop`. Git then has no common ancestor to
work from and falls back to the first commit of the repository:

```bash
git merge-base origin/main origin/develop   # -> f9ad411, "Initial commit"
```

Every file touched on both branches is reported as an add/add conflict from
there, even when the two sides are byte-identical — 27 files on the 0.5.0
release. The damage compounds: each squashed release adds another orphan commit,
so the next release conflicts harder than the last.

A merge commit has two parents. It links `main` to `develop`, the merge base
becomes the real one, and the following release compares only what actually
changed.

Squash stays the right choice for `feature/*` → `develop`: those branches are
deleted right after, so no genealogy is lost, and `develop` stays readable.

### Checking the genealogy is intact

After a release is merged into `main`:

```bash
git fetch origin && git merge-base origin/main origin/develop
```

It must print the recent merge commit. If it prints the initial commit, the PR
was squashed and the link is broken again.

### Repairing a broken link

The repair is a merge that changes no file — it only reconnects the two
branches. Carry it in the next release PR: branch from `develop`, merge
`origin/main` into it with `--no-ff` (resolve conflicts by keeping the `develop`
side, which is already a superset), then merge that PR with a merge commit.

Verify the resolution changed nothing before pushing:

```bash
git diff --stat origin/develop   # must be empty
```

### Repository settings this depends on

`allow_merge_commit` must stay enabled, otherwise GitHub only offers Squash and
the release PR cannot be merged correctly:

```bash
gh api repos/AdamDjo/PortfolioAI --jq '{merge_commit:.allow_merge_commit, squash:.allow_squash_merge}'
```
