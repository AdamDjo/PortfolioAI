import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { resolvePayloadEmailAdapter } from '@/lib/email/payload'
import { isJobRunnerRequest } from '@/lib/job-runner'
import { requireEnv } from '@/lib/require-env'

import { AIKnowledge } from './collections/ai-knowledge'
import { AITools } from './collections/ai-tools'
import { Bookmarks } from './collections/bookmarks'
import { Conversations } from './collections/conversations'
import { Experiences } from './collections/experiences'
import { Media } from './collections/media'
import { Posts } from './collections/posts'
import { Projects } from './collections/projects'
import { Tags } from './collections/tags'
import { Users } from './collections/users'
import { editor } from './editor'
import { AssistantSettings } from './globals/assistant-settings'
import { Availability } from './globals/availability'
import { Profile } from './globals/profile'
import { ServicesSettings } from './globals/services-settings'
import { SiteIdentity } from './globals/site-identity'

// Required, never defaulted: an empty secret signs session cookies and reset
// tokens with a value anyone can reproduce. See lib/require-env.
const payloadSecret = requireEnv('PAYLOAD_SECRET')

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Adem',
    },
  },
  collections: [
    Users,
    Media,
    Posts,
    Projects,
    Experiences,
    Tags,
    Bookmarks,
    AIKnowledge,
    AITools,
    Conversations,
  ],
  globals: [SiteIdentity, Availability, Profile, AssistantSettings, ServicesSettings],
  /**
   * Editorial content exists once per language on the fields marked `localized`.
   *
   * `defaultLocale` is French because that is the language the existing content
   * was written in, and it is what `fallback` serves for any field a translation
   * has not reached yet — so the site is never blank while translation is in
   * progress. It is deliberately *not* the site's default language: the public
   * site serves English first (see `src/i18n/routing.ts`). The two answer
   * different questions — which language a visitor gets, versus which language
   * stands in when a translation is missing.
   */
  localization: {
    locales: [
      // `code`, not `value`: the JSDoc example on LocalizationConfigWithLabels
      // says `value`, but the `Locale` type it points to declares `code`, and a
      // wrong key silently yields an empty `_locales` enum at migration time.
      { label: 'Français', code: 'fr' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },
  /*
   * The job queue, which today carries a single task: the scheduled publish of
   * `posts`. Payload registers that task itself from `schedulePublish`; what it
   * does not provide is something that executes it. That executor is the
   * server's own timer in `src/instrumentation-node.ts`, calling
   * `/api/payload-jobs/run` every minute.
   *
   * Payload's `autoRun` would be the obvious choice and is deliberately not
   * used: it runs jobs from a bare timer, outside any Next request, where the
   * publish hook's `revalidatePath` cannot work — the article would be
   * published in the database and stay a 404 on the site.
   *
   * The run endpoint stays closed to visitors: a signed-in user, or the
   * server's runner presenting its token.
   */
  jobs: {
    access: {
      run: ({ req }) =>
        Boolean(req.user) || isJobRunnerRequest(req.headers.get('authorization'), payloadSecret),
    },
  },
  editor,
  secret: payloadSecret,
  // Absent when the sending domain is not configured. Payload then reports that
  // email is unavailable rather than pretending a reset link was delivered.
  email: resolvePayloadEmailAdapter(),
  typescript: {
    // Generated types live at src/payload-types.ts, one level up from this
    // config, so they resolve through the plain @/payload-types alias.
    outputFile: path.resolve(dirname, '..', 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: requireEnv('DATABASE_URI'),
      /*
       * Capped well below the pooler's own limit, because the build is what
       * saturates it: `next build` prerenders with three worker processes, each
       * booting its own Payload and so its own pool. At the driver's default of
       * ten per pool that is thirty connections asked of a pooler that allows
       * fifteen, and the build dies with `EMAXCONNSESSION` on whichever page
       * happens to be reading at the time.
       *
       * Four leaves headroom under that ceiling with the three workers, and is
       * ample at runtime: the public pages are prerendered, so a request reaches
       * the database only for the admin, the chat and the veille page.
       */
      max: 4,
    },
    // Migrations are the single source of truth for the schema: `push` is
    // disabled so dev and production can never drift apart.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
})
