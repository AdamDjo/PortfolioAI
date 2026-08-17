import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Renames the site identity's name column to reflect what it actually holds.
 *
 * The field started out as the owner's full legal name, but the site only ever
 * shows a first name; the complete identity belongs in the legal notice, where
 * French law requires it, and lives in `legal_publisher`. `RENAME COLUMN` keeps
 * the stored value — a drop-and-create would silently discard it.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_identity" RENAME COLUMN "contact_full_name" TO "contact_display_name";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_identity" RENAME COLUMN "contact_display_name" TO "contact_full_name";`)
}
