// @ts-check
"use strict";

const tseslint = require("typescript-eslint");
const { createBaseConfig } = require("./index.js");

/**
 * ESLint flat config factory for the Express/Node backend.
 *
 * @param {{ tsconfigRootDir: string }} options
 * @returns {import('typescript-eslint').ConfigArray}
 */
function createBackendConfig({ tsconfigRootDir }) {
  return tseslint.config(...createBaseConfig({ tsconfigRootDir }), {
    files: ["**/*.ts"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-restricted-syntax": [
        "error",
        {
          selector: 'CallExpression[callee.property.name="then"]',
          message: "Use async/await instead of .then()",
        },
      ],
    },
  });
}

module.exports = { createBackendConfig };
