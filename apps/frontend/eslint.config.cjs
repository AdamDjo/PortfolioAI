// @ts-check
'use strict'

const { createNextConfig } = require('@portfolio/eslint-config/next')

module.exports = [
  // Fichiers générés par la CLI Payload : toute correction manuelle serait
  // écrasée à la prochaine génération. Les migrations en font partie — leur
  // contenu est produit par `migrate:create` — mais elles restent relues et
  // versionnées, car elles décrivent le schéma de la base.
  {
    ignores: ['src/app/(payload)/**', 'src/payload-types.ts', 'src/migrations/**'],
  },
  ...createNextConfig({ tsconfigRootDir: __dirname }),
]
