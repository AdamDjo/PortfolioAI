import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/test/**', '**/*.d.ts'],
    },
  },
  resolve: {
    // Mirrors the `paths` of tsconfig.json: `@payload-config` is resolved by the
    // Next build, and Vitest has to be told about it separately or any module
    // importing it fails to load — before `vi.mock` ever gets a chance to run.
    alias: {
      '@': resolve(__dirname, './src'),
      '@payload-config': resolve(__dirname, './src/cms/payload.config.ts'),
    },
  },
})
