import { getPayload } from 'payload'

import config from '@payload-config'

import { experiences, identity, profile, projects } from './content'

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
 */
const seed = async (): Promise<void> => {
  const payload = await getPayload({ config })

  await payload.updateGlobal({
    slug: 'site-identity',
    data: identity,
    overrideAccess: true,
  })
  payload.logger.info('Seeded global: site-identity')

  await payload.updateGlobal({
    slug: 'profile',
    data: profile,
    overrideAccess: true,
  })
  payload.logger.info('Seeded global: profile')

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
        overrideAccess: true,
      })
      payload.logger.info(`Updated experience: ${experience.company}`)
    } else {
      await payload.create({ collection: 'experiences', data, overrideAccess: true })
      payload.logger.info(`Created experience: ${experience.company}`)
    }
  }

  for (const project of projects) {
    const existing = await payload.find({
      collection: 'projects',
      where: { url: { equals: project.url } },
      limit: 1,
      overrideAccess: true,
    })

    const [current] = existing.docs
    if (current) {
      await payload.update({
        collection: 'projects',
        id: current.id,
        data: project,
        overrideAccess: true,
      })
      payload.logger.info(`Updated project: ${project.title}`)
    } else {
      await payload.create({ collection: 'projects', data: project, overrideAccess: true })
      payload.logger.info(`Created project: ${project.title}`)
    }
  }

  payload.logger.info('Seed complete.')
}

await seed()
// Payload keeps the Postgres pool open; the script has nothing left to do.
process.exit(0)
