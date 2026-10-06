import { deriveJobRunnerToken } from '@/lib/job-runner'
import { requireEnv } from '@/lib/require-env'

const RUN_INTERVAL_MS = 60_000

/**
 * Runs Payload's job queue once a minute for as long as the server is up.
 *
 * The queue holds the scheduled publishes of `posts`. Each tick is a request to
 * the server's own `/api/payload-jobs/run`, not an in-process call, so the jobs
 * execute inside a Next request where the publish hook can regenerate the
 * pages — see `lib/job-runner.ts`. Starting it here, at boot, is what makes it
 * impossible to forget: no external cron to configure, no admin visit needed
 * after a redeploy.
 *
 * Needs a long-running server — the Docker image on the VPS. On a serverless
 * host nothing would keep this timer alive.
 */
const startJobRunner = (): void => {
  // The build's prerender workers also boot a server instance; none of them
  // should run the queue.
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const url = `http://127.0.0.1:${process.env.PORT ?? '3000'}/api/payload-jobs/run`
  const headers = { Authorization: `Bearer ${deriveJobRunnerToken(requireEnv('PAYLOAD_SECRET'))}` }
  let running = false

  const tick = async (): Promise<void> => {
    // A slow run must not overlap the next one and publish the same job twice.
    if (running) return
    running = true
    try {
      const response = await fetch(url, { headers, cache: 'no-store' })
      if (!response.ok) console.error(`[jobs] Queue run answered ${response.status}.`)
    } catch (error) {
      console.error('[jobs] Queue run failed.', error)
    } finally {
      running = false
    }
  }

  // `unref` so the timer never keeps a stopping process alive.
  setInterval(() => void tick(), RUN_INTERVAL_MS).unref()
}

export { startJobRunner }
