/**
 * Reads an environment variable the application cannot run without.
 *
 * The alternative this replaces — `process.env.X ?? ''` — is worse than a crash.
 * Payload accepts an empty secret and boots: session cookies and password reset
 * tokens are then signed with a value an attacker does not even have to steal.
 * An empty connection string fails later, far from its cause, as a driver error
 * that names nothing.
 *
 * Both are configuration mistakes, and a configuration mistake belongs at load
 * time, in a message that names the variable. A blank value counts as missing —
 * `PAYLOAD_SECRET=""` sitting in a `.env` copied from the example is the exact
 * case this catches.
 */
const requireEnv = (name: string, env: NodeJS.ProcessEnv = process.env): string => {
  const value = env[name]?.trim()

  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. See .env.example: the application cannot start without it.`
    )
  }

  return value
}

export { requireEnv }
