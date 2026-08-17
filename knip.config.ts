import type { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    "apps/frontend": {
      // Knip resolves Next.js and Vitest entry points on its own through their
      // plugins: only the entry points it cannot infer are listed here.
      entry: [
        // Run through `pnpm seed`, not imported by the app.
        "src/seed/index.ts",
      ],
      // Invoked by `.lintstagedrc.js` as a workspace binary rather than imported,
      // so Knip cannot trace it. The dependency is real: dropping it would break
      // formatting on commit.
      ignoreDependencies: ["prettier"],
    },
    "packages/shared": {},
  },
};

export default config;
