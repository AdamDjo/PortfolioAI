---
name: boostperf
description: Measures the site with Lighthouse on a production build and fixes what it finds, until every category scores as high as it honestly can. Usage: /boostperf [paths…] — e.g. /boostperf /fr /en/projets
disable-model-invocation: true
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

Audit the frontend with Lighthouse and fix the real defects it surfaces.

The single rule that governs everything below: **a Lighthouse report is only
worth acting on if it was taken against a production build with a warm image
cache.** Every other instruction here exists to protect that rule or to act on
what a valid report says.

## Phase 0 — Build the measurement rig

Never measure `next dev`. Turbopack does not minify or tree-shake in
development, so a dev report invents problems that do not exist in production —
a 2.1 MB `simple-icons` barrel that tree-shakes down to 41 KB, hundreds of KiB
"to minify", forced reflows belonging to `next-devtools` and to whatever browser
extensions the developer has installed. Acting on those is wasted work.

1. Install dependencies if `node_modules` is missing: `pnpm install`.

2. Payload prerenders pages from PostgreSQL, so the build needs a database.
   If `DATABASE_URI` does not point at a reachable server, stand one up:

   ```bash
   apt-get install -y --no-install-recommends postgresql
   pg_ctlcluster 16 main start || service postgresql start
   su postgres -c "psql -c \"CREATE ROLE portfolio LOGIN PASSWORD 'portfolio' SUPERUSER;\""
   su postgres -c "psql -c 'CREATE DATABASE portfolio OWNER portfolio;'"
   ```

   Then write `apps/frontend/.env.local` (it is gitignored) with
   `PAYLOAD_SECRET`, `DATABASE_URI` and `NEXT_PUBLIC_SERVER_URL`, and run
   `pnpm --filter @portfolio/frontend migrate` then `… seed`.

3. Set `NEXT_PUBLIC_SERVER_URL` to **exactly** the host you will measure. Point
   it at `localhost` and then audit `127.0.0.1` and the canonical tag will
   disagree with the page URL — Lighthouse drops SEO to 92 and blames the site
   for a mistake in the harness. The same trap is real in production: that
   variable must match the served domain or the canonical is wrong for everyone.

4. Copy `audit.sh` (next to this file) somewhere writable and read its usage
   header. It handles the two traps that silently corrupt results:

   - **A stale server on :3000.** `pnpm start` fails with `EADDRINUSE` and the
     *old* build keeps answering, so you measure code you did not write. The
     script kills the port holder first.
   - **A cold image cache.** The first request for an AVIF rendition makes sharp
     encode it on the fly, which costs seconds and lands entirely in the LCP's
     "Load Time" phase. A real deployment pays that once; your measurement should
     not. The script walks each page's `/_next/image` URLs with a browser-like
     `Accept` header before Lighthouse runs.

## Phase 1 — Baseline

Measure the paths the user named, or every public page if they named none, on
**both** presets. Desktop and mobile fail differently: `font-size` and
`render-blocking-resources` are mobile-only audits, and mobile throttling is what
exposes LCP problems.

Record the baseline before touching anything. You will need it to prove the work
mattered, and to notice when a change makes something worse.

## Phase 2 — Read the report honestly

For each failing audit, decide which of three kinds it is:

- **A dev artifact.** Ignore it, and say so — do not let it reappear next time.
- **A harness artifact** (canonical host mismatch, cold cache, stale server).
  Fix the harness, not the site.
- **A real defect.** Fix it.

Two habits protect this phase:

- **Read `metrics.details.items[0]` for `observed*` values** alongside the
  headline number. Lighthouse's default mobile run is *simulated*: it traces on
  an unthrottled machine and models a slow one. When observed LCP is 298 ms and
  the reported figure is 3.3 s, the gap is Lantern's model of how much JavaScript
  must download and execute first — which is still a real finding, but a
  different one from "the image is slow".
- **When the model and your intuition disagree, measure directly.** Drive
  Chromium with real CPU and network throttling and log the
  `largest-contentful-paint` entries. Ground truth beats theorising, and it is a
  few minutes of work.

## Phase 3 — Fix, one lever at a time

Change one thing, rebuild, re-measure. Batching changes hides which one helped
and which one hurt. If a change does not move the number, revert it rather than
carrying dead complexity.

Check this list first — each entry is a defect previously found in this
codebase, with the reasoning that makes it a defect rather than a preference:

| Look for | Why it matters |
|---|---|
| `Critical-CH` on public routes | `withPayload` appends `Accept-CH`/`Vary`/`Critical-CH: Sec-CH-Prefers-Color-Scheme` to `/:path*`. `Critical-CH` is an order, not a hint: a browser that did not send it **restarts the navigation**. Scope it to `/admin/:path*` |
| LCP image without `fetchPriority="high"` | Next 16's `priority` only emits the preload link; it no longer forwards a priority hint |
| `images.formats` without AVIF | Typically halves the LCP image. Re-warm the cache after enabling it |
| `images.deviceSizes` starting at 640 | `getWidths` keeps only candidates ≥ `deviceSizes[0] × smallest vw in sizes`, so a `70vw` image can never be served below 640 px |
| `unoptimized` on a local image | The flag belongs on remote hosts that cannot be allowlisted. On a bundled file it ships the full-size original |
| No `experimental.inlineCss` | The stylesheet costs a render-blocking round trip |
| `filter: blur()` in an animation | Not compositable: repaints the whole subtree on the main thread every frame, during hydration. Also wraps the LCP element in a filtered stacking context. Same for animating `height: auto` |
| `getBoundingClientRect()` in a `pointermove` handler | Forces synchronous layout dozens of times a second. Measure once on pointer enter |
| Reading layout in an effect right after a commit | Defer the read to `requestAnimationFrame` so the browser lays out once |
| `@vercel/analytics` / `@vercel/speed-insights` off Vercel | They request `/_vercel/insights/*`, which exists only on Vercel: two 404s and two MIME errors per page view. Gate on `process.env.VERCEL` |
| `font-size` below 12 px | Check against the project's own type scale (`--text-2xs`) — values under it are drift, not design. Lighthouse fails the page below 60 % legible text |
| No `browserslist` | Next ships polyfills for `Array.prototype.at`, `Object.hasOwn` and friends. Set targets to what the CSS already requires (`color-mix()` ⇒ Chrome 111 / Firefox 113 / Safari 16.4) |
| Generic link text | "Learn more", "click here" and the like fail `link-text` and tell a screen-reader user nothing. Name the destination |

## Phase 4 — Prove nothing broke

Performance work that breaks the design is not a win.

1. `pnpm lint`, `pnpm type-check`, `pnpm test` — all must pass.
2. Screenshot the changed pages at 412 px and 1440 px and **look at them**.
3. Assert no horizontal overflow: `document.documentElement.scrollWidth` must
   equal `window.innerWidth`.
4. If you touched motion, scroll the whole page and assert nothing is left
   transparent — reveal variants that stop firing leave sections invisible, and a
   full-page screenshot alone will not tell you, because content below the fold
   is legitimately hidden until scrolled to.
5. Re-measure after the final formatting pass: `lint-staged` rewrites files on
   commit, so the code you measured is not necessarily the code you committed.

## Phase 5 — Report

Give a before/after table per page and preset. Then, for anything still short of
100, say plainly **why**, and whether closing it is a setting or a redesign. A
number the user cannot act on is worse than an honest limit.

Record the method and the findings in `docs/MEMORY.md` under a
Performance heading, so the next session does not re-derive the rig or fall into
the same traps.

Do not chase an audit at the expense of the product. Shrinking a hero image until
`uses-responsive-images` goes green, or deleting an animation the design depends
on, trades something the user values for a number they do not see. When a fix has
a real design cost, put the choice to them rather than deciding alone.
