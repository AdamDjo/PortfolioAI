/**
 * Runs once when a server instance boots. Node-only work lives in
 * `instrumentation-node.ts`: the `NEXT_RUNTIME` check has to sit right around
 * the import for Next to drop it from the Edge bundle.
 */
export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startJobRunner } = await import('./instrumentation-node')
    startJobRunner()
  }
}
