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

2. **Show the commits that will be brought into develop**

3. **Merge main into develop**

   ```bash
   git checkout develop
   git pull origin develop
   git merge origin/main --no-edit
   ```

4. **Push develop**

   ```bash
   git push origin develop
   ```

5. **Confirm:**

   ```
   ✅ develop is now up to date with main

   Ready to start a new feature: /feature <name>
   ```
