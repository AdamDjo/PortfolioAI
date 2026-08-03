#!/bin/bash
# GitHub initialization script: labels + milestones
# Usage: bash .github/setup-github.sh
#   - Uses gh CLI (already authenticated via `gh auth login`)
#   - Or: GITHUB_TOKEN=xxx GITHUB_REPOSITORY=owner/repo bash .github/setup-github.sh

set -e

# ── Detect repo ───────────────────────────────────────────────────────────────
if [ -n "$GITHUB_REPOSITORY" ]; then
  REPO="$GITHUB_REPOSITORY"
elif gh repo view --json nameWithOwner -q .nameWithOwner &>/dev/null 2>&1; then
  REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
else
  echo "Could not detect repo. Set GITHUB_REPOSITORY=owner/repo or run inside a git repo linked to GitHub."
  exit 1
fi

echo "Repository: $REPO"
echo ""

# ── Custom phase names ────────────────────────────────────────────────────────
read -rp "Phase 1 name? [Foundation] " PHASE1; PHASE1="${PHASE1:-Foundation}"
read -rp "Phase 2 name? [MVP]         " PHASE2; PHASE2="${PHASE2:-MVP}"
read -rp "Phase 3 name? [Polish]      " PHASE3; PHASE3="${PHASE3:-Polish}"

echo ""

# ── Helpers ───────────────────────────────────────────────────────────────────
create_label() {
  local name="$1" color="$2" description="$3"
  if gh label create "$name" --color "$color" --description "$description" --repo "$REPO" 2>/dev/null; then
    echo "  ✓ $name"
  else
    gh label edit "$name" --color "$color" --description "$description" --repo "$REPO" 2>/dev/null \
      && echo "  ~ $name (updated)" \
      || echo "  · $name (skipped)"
  fi
}

create_milestone() {
  local title="$1" description="$2"
  if gh api "repos/$REPO/milestones" \
    --method POST \
    --field title="$title" \
    --field description="$description" \
    --silent 2>/dev/null; then
    echo "  ✓ $title"
  else
    echo "  · $title (already exists)"
  fi
}

# ── Labels ────────────────────────────────────────────────────────────────────
echo "=== Creating labels ==="

create_label "type: feature"   "0075ca" "New feature or request"
create_label "type: bug"       "d73a4a" "Something isn't working"
create_label "type: chore"     "e4e669" "Maintenance, tooling, config"
create_label "type: docs"      "cfd3d7" "Documentation only"
create_label "type: refactor"  "d4c5f9" "Code refactoring, no behavior change"
create_label "type: release"   "0e8a16" "Release branch PR"

create_label "priority: high"   "ff6b35" "Must fix this sprint"
create_label "priority: medium" "fbca04" "This week"
create_label "priority: low"    "c2e0c6" "Backlog"

create_label "domain: frontend" "bfd4f2" "Frontend"
create_label "domain: backend"  "d4c5f9" "Backend"
create_label "domain: shared"   "c2e0c6" "Shared types/constants"
create_label "domain: database" "f9d0c4" "Database / schema"
create_label "domain: devops"   "e4e669" "CI/CD, GitHub Actions, Docker"

create_label "phase: 1" "0075ca" "Phase 1 — $PHASE1"
create_label "phase: 2" "003d8f" "Phase 2 — $PHASE2"
create_label "phase: 3" "f9d0c4" "Phase 3 — $PHASE3"

create_label "status: blocked"    "e11d48" "Blocked by a dependency"
create_label "status: needs-info" "d876e3" "Needs more information"
create_label "status: in-review"  "0075ca" "Under review"

# ── Milestones ────────────────────────────────────────────────────────────────
echo ""
echo "=== Creating milestones ==="

create_milestone "Phase 1 — $PHASE1" "Core infrastructure ready"
create_milestone "Phase 2 — $PHASE2" "Fully working product"
create_milestone "Phase 3 — $PHASE3" "Production-ready"

echo ""
echo "Done! Visit https://github.com/$REPO/labels to review."
