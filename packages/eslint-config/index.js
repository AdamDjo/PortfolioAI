// @ts-check
"use strict";

const tseslint = require("typescript-eslint");
const importX = require("eslint-plugin-import-x");
const prettierConfig = require("eslint-config-prettier");

/**
 * Base ESLint flat config factory for all TypeScript packages in the monorepo.
 *
 * @param {{ tsconfigRootDir: string }} options
 * @returns {import('typescript-eslint').ConfigArray}
 */
function createBaseConfig({ tsconfigRootDir }) {
  return tseslint.config(
    {
      ignores: [
        "**/dist/**",
        "**/node_modules/**",
        "**/.next/**",
        "**/coverage/**",
      ],
    },
    ...tseslint.configs.recommendedTypeChecked.map((config) => ({
      ...config,
      files: ["**/*.ts", "**/*.tsx"],
    })),
    ...tseslint.configs.stylisticTypeChecked.map((config) => ({
      ...config,
      files: ["**/*.ts", "**/*.tsx"],
    })),
    {
      files: ["**/*.ts", "**/*.tsx"],
      plugins: {
        "import-x": importX,
      },
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      settings: {
        "import-x/resolver": {
          typescript: {
            project: `${tsconfigRootDir}/tsconfig.json`,
          },
        },
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { prefer: "type-imports", fixStyle: "inline-type-imports" },
        ],
        "@typescript-eslint/no-import-type-side-effects": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/no-misused-promises": [
          "error",
          { checksVoidReturn: { attributes: false } },
        ],
        "import-x/no-duplicates": "error",
        "import-x/no-self-import": "error",
        "import-x/no-cycle": ["error", { maxDepth: 3 }],
        "import-x/order": [
          "error",
          {
            groups: [
              "builtin",
              "external",
              "internal",
              "parent",
              "sibling",
              "index",
              "type",
            ],
            "newlines-between": "always",
            alphabetize: { order: "asc", caseInsensitive: true },
          },
        ],
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "prefer-const": "error",
        "no-var": "error",
      },
    },
    prettierConfig,
  );
}

module.exports = { createBaseConfig };
