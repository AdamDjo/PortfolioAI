#!/usr/bin/env bash
#
# Lighthouse harness for /boostperf.
#
#   audit.sh <outdir> <preset> <path...>
#
#     outdir   directory for the JSON reports and the summary
#     preset   "desktop" | "mobile"
#     path...  site paths to audit, e.g. /fr /en /fr/projets
#
# Assumes a production build already exists (`pnpm --filter @portfolio/frontend
# build`) and that the database it prerendered from is still reachable.
#
# It exists to hold two invariants that are easy to lose by hand, and that
# silently produce numbers describing something other than your code:
#
#   1. Whatever already listens on :3000 is killed first. `pnpm start` fails
#      with EADDRINUSE and leaves the previous build serving, so the report
#      describes code you replaced.
#   2. Every `/_next/image` URL on every audited page is fetched with a
#      browser-like Accept header before Lighthouse runs. A cold AVIF entry is
#      encoded on demand, costs seconds, and lands entirely in the LCP's
#      "Load Time" phase.
set -euo pipefail

OUTDIR=${1:?usage: audit.sh <outdir> <preset> <path...>}
PRESET=${2:?usage: audit.sh <outdir> <preset> <path...>}
shift 2
PATHS=("$@")
[ ${#PATHS[@]} -gt 0 ] || PATHS=(/fr /en)

# `localhost`, not `127.0.0.1`: it must match NEXT_PUBLIC_SERVER_URL or the
# canonical tag points at a different host and SEO drops for no real reason.
ORIGIN=${ORIGIN:-http://localhost:3000}
APP_DIR=${APP_DIR:-apps/frontend}
CHROME=${CHROME_PATH:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}
ACCEPT='image/avif,image/webp,image/apng,image/svg+xml,*/*;q=0.8'

mkdir -p "$OUTDIR"

[ -x "$CHROME" ] || { echo "no Chrome at $CHROME — set CHROME_PATH" >&2; exit 1; }

# Installed once into the output directory and reused. `npx lighthouse@12` would
# re-resolve the package on every call, which is slow and fails outright behind a
# restrictive proxy.
LH="$OUTDIR/node_modules/lighthouse/cli/index.js"
if [ ! -f "$LH" ]; then
  echo "==> installing lighthouse into $OUTDIR"
  npm install --silent --no-save --prefix "$OUTDIR" lighthouse@12 >/dev/null
fi
[ -f "$LH" ] || { echo "lighthouse install failed" >&2; exit 1; }

echo "==> restarting the production server"
for pid in $(ps -eo pid,cmd | grep -E 'next-server|next start' | grep -v grep | awk '{print $1}'); do
  kill "$pid" 2>/dev/null || true
done
sleep 2

# setsid + closed stdin, and stdout/stderr on their own file: a child that
# inherits this script's stdout keeps the pipe open, so a caller piping us into
# `tail` or `head` would hang forever waiting for EOF.
( cd "$APP_DIR" && setsid pnpm start > "$OUTDIR/server.log" 2>&1 < /dev/null & )

for _ in $(seq 1 40); do
  sleep 1
  if [ "$(curl -s -o /dev/null -w '%{http_code}' "$ORIGIN${PATHS[0]}")" = "200" ]; then
    ready=1; break
  fi
done
[ "${ready:-0}" = "1" ] || { echo "server never came up:" >&2; tail -20 "$OUTDIR/server.log" >&2; exit 1; }

echo "==> warming the image optimiser"
for p in "${PATHS[@]}"; do
  curl -s "$ORIGIN$p" \
    | grep -oE '/_next/image\?url=[^" ]+' | sed 's/&amp;/\&/g' | sort -u \
    | while read -r img; do curl -s -H "Accept: $ACCEPT" -o /dev/null "$ORIGIN$img"; done
done
sleep 1

preset_flag=""
[ "$PRESET" = "desktop" ] && preset_flag="--preset=desktop"

echo "==> auditing (${PRESET})"
printf '%-22s%s\n' "PAGE" "PERF A11Y BEST  SEO"
for p in "${PATHS[@]}"; do
  name="$PRESET$(echo "$p" | tr '/' '_')"
  CHROME_PATH="$CHROME" node "$LH" "$ORIGIN$p" \
    --quiet --output=json --output-path="$OUTDIR/$name.json" \
    --only-categories=performance,accessibility,best-practices,seo \
    --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu" \
    $preset_flag >/dev/null 2>&1
  node -e '
    const r = require(process.argv[1]);
    const pct = (c) => String(Math.round((c.score ?? 0) * 100)).padStart(4);
    const c = r.categories;
    process.stdout.write(
      process.argv[2].padEnd(22) +
      pct(c.performance) + pct(c.accessibility) + pct(c["best-practices"]) + pct(c.seo) + "\n"
    );
  ' "$OUTDIR/$name.json" "$p"
done

echo
echo "==> failing audits (non-perfect, scored)"
for p in "${PATHS[@]}"; do
  name="$PRESET$(echo "$p" | tr '/' '_')"
  node -e '
    const r = require(process.argv[1]);
    const rows = [];
    for (const [key, cat] of Object.entries(r.categories)) {
      for (const ref of cat.auditRefs) {
        const a = r.audits[ref.id];
        if (!a || a.score === null || a.score >= 1) continue;
        if (["informative", "notApplicable", "manual"].includes(a.scoreDisplayMode)) continue;
        rows.push(`    [${key}] ${a.score} ${ref.id} — ${a.title}`);
      }
    }
    if (rows.length) console.log(`  ${process.argv[2]}\n${rows.join("\n")}`);
  ' "$OUTDIR/$name.json" "$p"
done

echo
echo "Reports in $OUTDIR. Read metrics.details.items[0] for observed* values"
echo "before trusting a simulated LCP."
