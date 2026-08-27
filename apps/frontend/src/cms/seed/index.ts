import { getPayload } from 'payload'

import { canonicalizeUrl } from '@/lib/canonical-url'
import config from '@payload-config'

import {
  experiences,
  identity,
  identityEn,
  profile,
  profileEn,
  projectDescriptionsEn,
  projects,
} from './content'

/**
 * Bootstraps an empty database with the real portfolio content.
 *
 * Run with `pnpm seed`. The script is idempotent: globals are overwritten, and
 * collection documents are matched on a natural key (company + start date for an
 * experience, URL for a project) so a second run updates instead of duplicating.
 *
 * Globals are written with `overrideAccess: true` because there is no logged-in
 * user in a CLI process — the access rules exist to protect the HTTP API, not a
 * script the owner runs against their own database.
 *
 * Each document is written twice: once in French, the default locale, then again
 * in English for the fields that carry a translation. The English pass reads the
 * document back first to reuse the array row ids — sending an array without them
 * makes Payload treat it as a new set of rows and drops the French values with
 * the old ones.
 */
const seed = async (): Promise<void> => {
  const payload = await getPayload({ config })

  await payload.updateGlobal({
    slug: 'site-identity',
    data: identity,
    locale: 'fr',
    overrideAccess: true,
  })
  await payload.updateGlobal({
    slug: 'site-identity',
    data: identityEn,
    locale: 'en',
    overrideAccess: true,
  })
  payload.logger.info('Seeded global: site-identity (fr, en)')

  await payload.updateGlobal({
    slug: 'profile',
    data: profile,
    locale: 'fr',
    overrideAccess: true,
  })

  // Read back for the row ids, then translate each row in place.
  const savedProfile = await payload.findGlobal({ slug: 'profile', overrideAccess: true })
  await payload.updateGlobal({
    slug: 'profile',
    locale: 'en',
    overrideAccess: true,
    data: {
      headline: profileEn.headline,
      bio: profileEn.bio,
      skillGroups: (savedProfile.skillGroups ?? []).map((group, index) => ({
        ...group,
        label: profileEn.skillGroupLabels[index] ?? group.label,
      })),
      principles: (savedProfile.principles ?? []).map((principle, index) => ({
        ...principle,
        ...(profileEn.principles[index] ?? {}),
      })),
    },
  })
  payload.logger.info('Seeded global: profile (fr, en)')

  for (const experience of experiences) {
    const { achievements, ...rest } = experience
    const data = {
      ...rest,
      achievements: achievements.map((statement) => ({ statement })),
    }

    const existing = await payload.find({
      collection: 'experiences',
      where: {
        and: [{ company: { equals: experience.company } }, { role: { equals: experience.role } }],
      },
      limit: 1,
      overrideAccess: true,
    })

    const [current] = existing.docs
    if (current) {
      await payload.update({
        collection: 'experiences',
        id: current.id,
        data,
        locale: 'fr',
        overrideAccess: true,
      })
      payload.logger.info(`Updated experience: ${experience.company}`)
    } else {
      await payload.create({ collection: 'experiences', data, locale: 'fr', overrideAccess: true })
      payload.logger.info(`Created experience: ${experience.company}`)
    }
  }

  for (const project of projects) {
    // The Open Graph hook canonicalizes the URL on save, so the stored value
    // carries a trailing slash the literal seed value does not. Matching on the
    // raw string finds nothing and the seed tries to create a duplicate, which
    // the unique index then rejects — the idempotency this script promises only
    // holds if the lookup uses the same form as the write.
    const existing = await payload.find({
      collection: 'projects',
      where: { url: { equals: canonicalizeUrl(project.url) ?? project.url } },
      limit: 1,
      overrideAccess: true,
    })

    const [current] = existing.docs
    const id = current
      ? (
          await payload.update({
            collection: 'projects',
            id: current.id,
            data: project,
            locale: 'fr',
            overrideAccess: true,
          })
        ).id
      : (
          await payload.create({
            collection: 'projects',
            data: project,
            locale: 'fr',
            overrideAccess: true,
          })
        ).id

    const description = projectDescriptionsEn[project.url]
    if (description) {
      await payload.update({
        collection: 'projects',
        id,
        data: { description },
        locale: 'en',
        overrideAccess: true,
      })
    }
    payload.logger.info(`Seeded project: ${project.title}`)
  }

  payload.logger.info('Seed complete.')
}

await seed()
// Payload keeps the Postgres pool open; the script has nothing left to do.
process.exit(0)
