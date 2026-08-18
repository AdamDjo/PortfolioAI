// @ts-check
"use strict";

const path = require("path");

/**
 * lint-staged config using functions so ESLint runs in the correct workspace
 * directory (each app has its own ESLint flat config).
 *
 * @type {import('lint-staged').Configuration}
 */
module.exports = {
  "apps/frontend/**/*.{ts,tsx}": (files) => {
    const cwd = path.join(__dirname, "apps/frontend");
    const relative = files.map((f) => path.relative(cwd, f)).join(" ");
    return [
      `pnpm --filter frontend exec eslint --fix ${relative}`,
      `pnpm --filter frontend exec prettier --ignore-unknown --write ${relative}`,
    ];
  },
  "packages/**/*.{ts,tsx,js}": (files) => {
    return [`prettier --write ${files.join(" ")}`];
  },
  // Filet de sécurité : tout autre fichier formatable, où qu'il soit dans le
  // monorepo (les .js et .css des applications n'étaient couverts par aucun
  // motif ci-dessus). `prettier --write` respecte .prettierignore, donc les
  // fichiers générés par les CLI Next et Payload sont ignorés, comme en CI.
  "**/*.{js,jsx,mjs,cjs,css,json,md,yml,yaml}": (files) => {
    return [`prettier --ignore-unknown --write ${files.join(" ")}`];
  },
};
