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

   After the merge into main, run: /sync
   ```
