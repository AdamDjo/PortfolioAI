import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Bookmarks } from './collections/bookmarks'
import { Media } from './collections/media'
import { Projects } from './collections/projects'
import { Tags } from './collections/tags'
import { Users } from './collections/users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Adem',
    },
  },
  collections: [Users, Media, Projects, Tags, Bookmarks],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? '',
    },
    // Les migrations sont la seule source de vérité du schéma :
    // « push » est désactivé pour ne jamais désynchroniser dev et production.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
})
