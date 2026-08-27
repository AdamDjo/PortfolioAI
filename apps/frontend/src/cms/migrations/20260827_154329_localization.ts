import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('fr', 'en');
  CREATE TABLE "projects_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "experiences_achievements_locales" (
  	"statement" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "experiences_locales" (
  	"role" varchar NOT NULL,
  	"location" varchar,
  	"project" varchar,
  	"context" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ai_knowledge_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ai_tools_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_identity_locales" (
  	"contact_role" varchar NOT NULL,
  	"contact_location" varchar,
  	"legal_data_policy" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "availability_locales" (
  	"label" varchar DEFAULT 'Disponible pour des opportunités' NOT NULL,
  	"detail" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "profile_skill_groups_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_principles_locales" (
  	"statement" varchar NOT NULL,
  	"detail" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_locales" (
  	"headline" varchar NOT NULL,
  	"bio" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "assistant_settings_locales" (
  	"unavailable_message" varchar DEFAULT 'L’assistant est momentanément indisponible. Vous pouvez me joindre directement, je réponds vite.' NOT NULL,
  	"retention_notice" varchar DEFAULT 'Les échanges sont conservés 30 jours de façon anonyme pour améliorer l’assistant.' NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_achievements_locales" ADD CONSTRAINT "experiences_achievements_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences_achievements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_locales" ADD CONSTRAINT "experiences_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_knowledge_locales" ADD CONSTRAINT "ai_knowledge_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_knowledge"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_tools_locales" ADD CONSTRAINT "ai_tools_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_identity_locales" ADD CONSTRAINT "site_identity_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_identity"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "availability_locales" ADD CONSTRAINT "availability_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."availability"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_skill_groups_locales" ADD CONSTRAINT "profile_skill_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_skill_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_principles_locales" ADD CONSTRAINT "profile_principles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_principles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_locales" ADD CONSTRAINT "profile_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "assistant_settings_locales" ADD CONSTRAINT "assistant_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."assistant_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "experiences_achievements_locales_locale_parent_id_unique" ON "experiences_achievements_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "experiences_locales_locale_parent_id_unique" ON "experiences_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "ai_knowledge_locales_locale_parent_id_unique" ON "ai_knowledge_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "ai_tools_locales_locale_parent_id_unique" ON "ai_tools_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "site_identity_locales_locale_parent_id_unique" ON "site_identity_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "availability_locales_locale_parent_id_unique" ON "availability_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "profile_skill_groups_locales_locale_parent_id_unique" ON "profile_skill_groups_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "profile_principles_locales_locale_parent_id_unique" ON "profile_principles_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "profile_locales_locale_parent_id_unique" ON "profile_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "assistant_settings_locales_locale_parent_id_unique" ON "assistant_settings_locales" USING btree ("_locale","_parent_id");

  -- Carry the existing content into the French locale before the source
  -- columns are dropped. migrate:create diffs the schema only, so without
  -- this every localized field would be silently emptied.

  INSERT INTO "projects_locales" ("description", "_locale", "_parent_id")
  SELECT "description", 'fr', "id" FROM "projects";
  INSERT INTO "experiences_achievements_locales" ("statement", "_locale", "_parent_id")
  SELECT "statement", 'fr', "id" FROM "experiences_achievements";
  INSERT INTO "experiences_locales" ("role", "location", "project", "context", "_locale", "_parent_id")
  SELECT "role", "location", "project", "context", 'fr', "id" FROM "experiences";
  INSERT INTO "ai_knowledge_locales" ("question", "answer", "_locale", "_parent_id")
  SELECT "question", "answer", 'fr', "id" FROM "ai_knowledge";
  INSERT INTO "ai_tools_locales" ("description", "_locale", "_parent_id")
  SELECT "description", 'fr', "id" FROM "ai_tools";
  INSERT INTO "site_identity_locales" ("contact_role", "contact_location", "legal_data_policy", "_locale", "_parent_id")
  SELECT "contact_role", "contact_location", "legal_data_policy", 'fr', "id" FROM "site_identity";
  INSERT INTO "availability_locales" ("label", "detail", "_locale", "_parent_id")
  SELECT "label", "detail", 'fr', "id" FROM "availability";
  INSERT INTO "profile_skill_groups_locales" ("label", "_locale", "_parent_id")
  SELECT "label", 'fr', "id" FROM "profile_skill_groups";
  INSERT INTO "profile_principles_locales" ("statement", "detail", "_locale", "_parent_id")
  SELECT "statement", "detail", 'fr', "id" FROM "profile_principles";
  INSERT INTO "profile_locales" ("headline", "bio", "_locale", "_parent_id")
  SELECT "headline", "bio", 'fr', "id" FROM "profile";
  INSERT INTO "assistant_settings_locales" ("unavailable_message", "retention_notice", "_locale", "_parent_id")
  SELECT "unavailable_message", "retention_notice", 'fr', "id" FROM "assistant_settings";
  ALTER TABLE "projects" DROP COLUMN "description";
  ALTER TABLE "experiences_achievements" DROP COLUMN "statement";
  ALTER TABLE "experiences" DROP COLUMN "role";
  ALTER TABLE "experiences" DROP COLUMN "location";
  ALTER TABLE "experiences" DROP COLUMN "project";
  ALTER TABLE "experiences" DROP COLUMN "context";
  ALTER TABLE "ai_knowledge" DROP COLUMN "question";
  ALTER TABLE "ai_knowledge" DROP COLUMN "answer";
  ALTER TABLE "ai_tools" DROP COLUMN "description";
  ALTER TABLE "site_identity" DROP COLUMN "contact_role";
  ALTER TABLE "site_identity" DROP COLUMN "contact_location";
  ALTER TABLE "site_identity" DROP COLUMN "legal_data_policy";
  ALTER TABLE "availability" DROP COLUMN "label";
  ALTER TABLE "availability" DROP COLUMN "detail";
  ALTER TABLE "profile_skill_groups" DROP COLUMN "label";
  ALTER TABLE "profile_principles" DROP COLUMN "statement";
  ALTER TABLE "profile_principles" DROP COLUMN "detail";
  ALTER TABLE "profile" DROP COLUMN "headline";
  ALTER TABLE "profile" DROP COLUMN "bio";
  ALTER TABLE "assistant_settings" DROP COLUMN "unavailable_message";
  ALTER TABLE "assistant_settings" DROP COLUMN "retention_notice";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  -- Restore each column as nullable, carry the French values back, then
  -- reinstate NOT NULL. Adding a NOT NULL column outright would fail on any
  -- table that already holds rows.

  ALTER TABLE "projects" ADD COLUMN "description" varchar;
  UPDATE "projects" SET "description" = l."description" FROM "projects_locales" l WHERE l."_parent_id" = "projects"."id" AND l."_locale" = 'fr';

  ALTER TABLE "experiences_achievements" ADD COLUMN "statement" varchar;
  UPDATE "experiences_achievements" SET "statement" = l."statement" FROM "experiences_achievements_locales" l WHERE l."_parent_id" = "experiences_achievements"."id" AND l."_locale" = 'fr';
  ALTER TABLE "experiences_achievements" ALTER COLUMN "statement" SET NOT NULL;

  ALTER TABLE "experiences" ADD COLUMN "role" varchar;
  ALTER TABLE "experiences" ADD COLUMN "location" varchar;
  ALTER TABLE "experiences" ADD COLUMN "project" varchar;
  ALTER TABLE "experiences" ADD COLUMN "context" varchar;
  UPDATE "experiences" SET "role" = l."role", "location" = l."location", "project" = l."project", "context" = l."context" FROM "experiences_locales" l WHERE l."_parent_id" = "experiences"."id" AND l."_locale" = 'fr';
  ALTER TABLE "experiences" ALTER COLUMN "role" SET NOT NULL;

  ALTER TABLE "ai_knowledge" ADD COLUMN "question" varchar;
  ALTER TABLE "ai_knowledge" ADD COLUMN "answer" varchar;
  UPDATE "ai_knowledge" SET "question" = l."question", "answer" = l."answer" FROM "ai_knowledge_locales" l WHERE l."_parent_id" = "ai_knowledge"."id" AND l."_locale" = 'fr';
  ALTER TABLE "ai_knowledge" ALTER COLUMN "question" SET NOT NULL;
  ALTER TABLE "ai_knowledge" ALTER COLUMN "answer" SET NOT NULL;

  ALTER TABLE "ai_tools" ADD COLUMN "description" varchar;
  UPDATE "ai_tools" SET "description" = l."description" FROM "ai_tools_locales" l WHERE l."_parent_id" = "ai_tools"."id" AND l."_locale" = 'fr';

  ALTER TABLE "site_identity" ADD COLUMN "contact_role" varchar;
  ALTER TABLE "site_identity" ADD COLUMN "contact_location" varchar;
  ALTER TABLE "site_identity" ADD COLUMN "legal_data_policy" varchar;
  UPDATE "site_identity" SET "contact_role" = l."contact_role", "contact_location" = l."contact_location", "legal_data_policy" = l."legal_data_policy" FROM "site_identity_locales" l WHERE l."_parent_id" = "site_identity"."id" AND l."_locale" = 'fr';
  ALTER TABLE "site_identity" ALTER COLUMN "contact_role" SET NOT NULL;

  ALTER TABLE "availability" ADD COLUMN "label" varchar DEFAULT 'Disponible pour des opportunités';
  ALTER TABLE "availability" ADD COLUMN "detail" varchar;
  UPDATE "availability" SET "label" = l."label", "detail" = l."detail" FROM "availability_locales" l WHERE l."_parent_id" = "availability"."id" AND l."_locale" = 'fr';
  ALTER TABLE "availability" ALTER COLUMN "label" SET NOT NULL;

  ALTER TABLE "profile_skill_groups" ADD COLUMN "label" varchar;
  UPDATE "profile_skill_groups" SET "label" = l."label" FROM "profile_skill_groups_locales" l WHERE l."_parent_id" = "profile_skill_groups"."id" AND l."_locale" = 'fr';
  ALTER TABLE "profile_skill_groups" ALTER COLUMN "label" SET NOT NULL;

  ALTER TABLE "profile_principles" ADD COLUMN "statement" varchar;
  ALTER TABLE "profile_principles" ADD COLUMN "detail" varchar;
  UPDATE "profile_principles" SET "statement" = l."statement", "detail" = l."detail" FROM "profile_principles_locales" l WHERE l."_parent_id" = "profile_principles"."id" AND l."_locale" = 'fr';
  ALTER TABLE "profile_principles" ALTER COLUMN "statement" SET NOT NULL;

  ALTER TABLE "profile" ADD COLUMN "headline" varchar;
  ALTER TABLE "profile" ADD COLUMN "bio" varchar;
  UPDATE "profile" SET "headline" = l."headline", "bio" = l."bio" FROM "profile_locales" l WHERE l."_parent_id" = "profile"."id" AND l."_locale" = 'fr';
  ALTER TABLE "profile" ALTER COLUMN "headline" SET NOT NULL;
  ALTER TABLE "profile" ALTER COLUMN "bio" SET NOT NULL;

  ALTER TABLE "assistant_settings" ADD COLUMN "unavailable_message" varchar DEFAULT 'L’assistant est momentanément indisponible. Vous pouvez me joindre directement, je réponds vite.';
  ALTER TABLE "assistant_settings" ADD COLUMN "retention_notice" varchar DEFAULT 'Les échanges sont conservés 30 jours de façon anonyme pour améliorer l’assistant.';
  UPDATE "assistant_settings" SET "unavailable_message" = l."unavailable_message", "retention_notice" = l."retention_notice" FROM "assistant_settings_locales" l WHERE l."_parent_id" = "assistant_settings"."id" AND l."_locale" = 'fr';
  ALTER TABLE "assistant_settings" ALTER COLUMN "unavailable_message" SET NOT NULL;
  ALTER TABLE "assistant_settings" ALTER COLUMN "retention_notice" SET NOT NULL;

  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "experiences_achievements_locales" CASCADE;
  DROP TABLE "experiences_locales" CASCADE;
  DROP TABLE "ai_knowledge_locales" CASCADE;
  DROP TABLE "ai_tools_locales" CASCADE;
  DROP TABLE "site_identity_locales" CASCADE;
  DROP TABLE "availability_locales" CASCADE;
  DROP TABLE "profile_skill_groups_locales" CASCADE;
  DROP TABLE "profile_principles_locales" CASCADE;
  DROP TABLE "profile_locales" CASCADE;
  DROP TABLE "assistant_settings_locales" CASCADE;
  DROP TYPE "public"."_locales";`)
}
