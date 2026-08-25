/**
 * The password reset message.
 *
 * Payload ships its own template, and it is replaced for two reasons. It is
 * written as HTML, while the transport posts markdown — an `<a>` tag would reach
 * the inbox as visible tag soup. And it is worded for an application with users,
 * whereas this admin has exactly one account: its owner, who needs the link and
 * the expiry, not an introduction.
 *
 * The field Payload fills is still called `html`; what goes into it here is
 * markdown, which is what `lib/email/payload.ts` forwards untouched.
 */

/** Where the admin serves the reset screen. Mirrors Payload's default routes, which the config does not override. */
const RESET_PATH = '/admin/reset'

const RESET_PASSWORD_SUBJECT = 'Réinitialisation de votre mot de passe'

/**
 * Resolves the site's own address.
 *
 * The request origin comes first because it is the address actually being
 * browsed, which is what makes the link work behind a proxy or on a preview
 * domain. The environment is the fallback for a reset triggered outside a
 * request — a script, the local CLI.
 */
const resolveOrigin = (requestOrigin?: string): string => {
  // A blank candidate counts as absent: `NEXT_PUBLIC_SERVER_URL=""` copied from
  // .env.example must not win over the fallback and produce a link to nowhere.
  const configured = [requestOrigin, process.env.NEXT_PUBLIC_SERVER_URL]
    .map((candidate) => candidate?.trim())
    .find((candidate) => candidate)

  return configured ?? 'http://localhost:3000'
}

/**
 * Builds the message body.
 *
 * The URL is written on its own line rather than behind a label: mail clients
 * linkify a bare URL, and a reader who has to check where a reset link points
 * can read it without hovering.
 */
const buildResetPasswordEmail = ({
  token,
  requestOrigin,
}: {
  token?: string
  requestOrigin?: string
}): string => {
  const url = `${resolveOrigin(requestOrigin)}${RESET_PATH}/${token ?? ''}`

  return [
    'Une réinitialisation du mot de passe a été demandée pour ce compte.',
    '',
    'Ouvrez ce lien pour en choisir un nouveau :',
    '',
    url,
    '',
    'Le lien expire dans une heure.',
    '',
    "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : le mot de passe actuel reste valable.",
  ].join('\n')
}

export { buildResetPasswordEmail, RESET_PASSWORD_SUBJECT }
