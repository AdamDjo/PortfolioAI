import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Bookmarks } from './collections/bookmarks'
import { Experiences } from './collections/experiences'
import { Media } from './collections/media'
import { Projects } from './collections/projects'
import { Tags } from './collections/tags'
import { Users } from './collections/users'
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
  collections: [Users, Media, Projects, Experiences, Tags, Bookmarks],
  globals: [SiteIdentity, Profile],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    // Generated types live at src/payload-types.ts, one level up from this
    // config, so they resolve through the plain @/payload-types alias.
    outputFile: path.resolve(dirname, '..', 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? '',
    },
    // Migrations are the single source of truth for the schema: `push` is
    // disabled so dev and production can never drift apart.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
})
