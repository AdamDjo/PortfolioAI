// @ts-check
"use strict";

const tseslint = require("typescript-eslint");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const nextPlugin = require("@next/eslint-plugin-next");
const { createBaseConfig } = require("./index.js");

/**
 * ESLint flat config factory for the Next.js 15 App Router frontend.
 *
 * @param {{ tsconfigRootDir: string }} options
 * @returns {import('typescript-eslint').ConfigArray}
 */
function createNextConfig({ tsconfigRootDir }) {
  return tseslint.config(
    { ignores: [".next/**", "cypress/**", "next-env.d.ts"] },
    ...createBaseConfig({ tsconfigRootDir }),
    {
      files: ["**/*.ts", "**/*.tsx"],
      plugins: {
        "@next/next": nextPlugin,
        "react-hooks": reactHooksPlugin,
      },
      rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs["core-web-vitals"].rules,
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  );
}

module.exports = { createNextConfig };
