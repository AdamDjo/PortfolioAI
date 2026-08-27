import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { resolvePayloadEmailAdapter } from '@/lib/email/payload'
import { requireEnv } from '@/lib/require-env'

import { AIKnowledge } from './collections/ai-knowledge'
import { AITools } from './collections/ai-tools'
import { Bookmarks } from './collections/bookmarks'
import { Conversations } from './collections/conversations'
import { Experiences } from './collections/experiences'
import { Media } from './collections/media'
import { Projects } from './collections/projects'
import { Tags } from './collections/tags'
import { Users } from './collections/users'
import { AssistantSettings } from './globals/assistant-settings'
import { Availability } from './globals/availability'
import { Profile } from './globals/profile'
import { SiteIdentity } from './globals/site-identity'

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
    Projects,
    Experiences,
    Tags,
    Bookmarks,
    AIKnowledge,
    AITools,
    Conversations,
  ],
  globals: [SiteIdentity, Availability, Profile, AssistantSettings],
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
  editor: lexicalEditor(),
  // Required, never defaulted: an empty secret signs session cookies and reset
  // tokens with a value anyone can reproduce. See lib/require-env.
  secret: requireEnv('PAYLOAD_SECRET'),
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
    },
    // Migrations are the single source of truth for the schema: `push` is
    // disabled so dev and production can never drift apart.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
})
