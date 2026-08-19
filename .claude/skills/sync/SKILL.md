---
name: sync
description: Syncs develop with main after a hotfix or release merge. Usage: /sync
allowed-tools: Bash
---

The user wants to sync develop with main (after a hotfix or release was merged into main).

Execute in order:

1. **Check current state**

   ```bash
   git fetch origin
   git log origin/develop..origin/main --oneline
   ```

   - If develop is already up to date with main, print "✅ develop is already up to date with main" and stop

2. **Verify the release PR was not squashed**

   ```bash
   git merge-base origin/main origin/develop
   ```

   If this prints the repository's first commit instead of the release merge,
   `main` was squashed and its link to `develop` is broken. Say so — the sync
   below will report phantom conflicts on files that are identical on both
   sides. The repair procedure is in the `/release` skill.

3. **Show the commits that will be brought into develop**

4. **Merge main into develop on a branch**

   `develop` is protected: never push to it directly. Create an issue first,
   then a branch from `develop`, and open a pull request.

   ```bash
   git checkout develop && git pull origin develop
   git checkout -b chore/<issue>-sync-develop-with-main
   git merge origin/main --no-edit
   git push -u origin chore/<issue>-sync-develop-with-main
   ```

5. **Open the PR toward `develop`** with the usual checklist (Closes #<issue>,
   assignee, labels, milestone, project). Adem merges it himself.

6. **Confirm:**

   ```
   ✅ Sync PR opened: <url>

   Merge it to bring main back into develop.
   Ready to start a new feature: /feature <name>
   ```
