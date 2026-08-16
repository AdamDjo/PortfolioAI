// @ts-check
'use strict'

const { createNextConfig } = require('@portfolio/eslint-config/next')

module.exports = [
  // Fichiers générés par la CLI Payload : toute correction manuelle serait
  // écrasée au prochain `generate`. Les migrations, elles, restent lintées.
  {
    ignores: ['src/app/(payload)/**', 'src/payload-types.ts'],
  },
  ...createNextConfig({ tsconfigRootDir: __dirname }),
]
