import type { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    "apps/frontend": {
      entry: [
        "src/app/**/page.tsx",
        "src/app/**/layout.tsx",
        "src/app/**/route.ts",
        "src/app/**/route.tsx",
        "src/app/**/loading.tsx",
        "src/app/**/error.tsx",
        "src/app/**/not-found.tsx",
        "src/test/setup.ts",
        "vitest.config.ts",
        "playwright.config.ts",
        "e2e/**/*.spec.ts",
        "next.config.ts",
      ],
      ignore: [
        ".next/**",
        "coverage/**",
        "playwright-report/**",
        "test-results/**",
      ],
    },
    "apps/backend": {
      entry: ["src/index.ts"],
      ignore: ["dist/**", "coverage/**"],
    },
    "packages/shared": {
      entry: ["src/index.ts"],
      ignore: ["dist/**"],
    },
  },
  ignore: ["**/*.d.ts"],
};

export default config;
