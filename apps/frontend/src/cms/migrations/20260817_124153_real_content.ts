import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "projects_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "experiences_achievements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"statement" varchar NOT NULL
  );
  
  CREATE TABLE "experiences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"location" varchar,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"current" boolean DEFAULT false,
  	"project" varchar,
  	"context" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "experiences_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "site_identity" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"contact_full_name" varchar NOT NULL,
  	"contact_role" varchar NOT NULL,
  	"contact_location" varchar,
  	"contact_email" varchar NOT NULL,
  	"social_github_url" varchar,
  	"social_linkedin_url" varchar,
  	"legal_publisher" varchar,
  	"legal_host_name" varchar,
  	"legal_host_address" varchar,
  	"legal_data_policy" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "profile_skill_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "profile_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"statement" varchar NOT NULL,
  	"detail" varchar
  );
  
  CREATE TABLE "profile" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar NOT NULL,
  	"bio" varchar NOT NULL,
  	"years_of_experience" numeric,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "profile_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "projects" ADD COLUMN "repository_url" varchar;
  ALTER TABLE "projects" ADD COLUMN "order" numeric DEFAULT 0;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "experiences_id" integer;
  ALTER TABLE "projects_texts" ADD CONSTRAINT "projects_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_achievements" ADD CONSTRAINT "experiences_achievements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_texts" ADD CONSTRAINT "experiences_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_skill_groups" ADD CONSTRAINT "profile_skill_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_principles" ADD CONSTRAINT "profile_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_texts" ADD CONSTRAINT "profile_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_texts_order_parent" ON "projects_texts" USING btree ("order","parent_id");
  CREATE INDEX "experiences_achievements_order_idx" ON "experiences_achievements" USING btree ("_order");
  CREATE INDEX "experiences_achievements_parent_id_idx" ON "experiences_achievements" USING btree ("_parent_id");
  CREATE INDEX "experiences_start_date_idx" ON "experiences" USING btree ("start_date");
  CREATE INDEX "experiences_updated_at_idx" ON "experiences" USING btree ("updated_at");
  CREATE INDEX "experiences_created_at_idx" ON "experiences" USING btree ("created_at");
  CREATE INDEX "experiences_texts_order_parent" ON "experiences_texts" USING btree ("order","parent_id");
  CREATE INDEX "profile_skill_groups_order_idx" ON "profile_skill_groups" USING btree ("_order");
  CREATE INDEX "profile_skill_groups_parent_id_idx" ON "profile_skill_groups" USING btree ("_parent_id");
  CREATE INDEX "profile_principles_order_idx" ON "profile_principles" USING btree ("_order");
  CREATE INDEX "profile_principles_parent_id_idx" ON "profile_principles" USING btree ("_parent_id");
  CREATE INDEX "profile_texts_order_parent" ON "profile_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experiences_fk" FOREIGN KEY ("experiences_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_order_idx" ON "projects" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_experiences_id_idx" ON "payload_locked_documents_rels" USING btree ("experiences_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "experiences_achievements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "experiences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "experiences_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_identity" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_skill_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_principles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "profile_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "projects_texts" CASCADE;
  DROP TABLE "experiences_achievements" CASCADE;
  DROP TABLE "experiences" CASCADE;
  DROP TABLE "experiences_texts" CASCADE;
  DROP TABLE "site_identity" CASCADE;
  DROP TABLE "profile_skill_groups" CASCADE;
  DROP TABLE "profile_principles" CASCADE;
  DROP TABLE "profile" CASCADE;
  DROP TABLE "profile_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_experiences_fk";
  
  DROP INDEX "projects_order_idx";
  DROP INDEX "payload_locked_documents_rels_experiences_id_idx";
  ALTER TABLE "projects" DROP COLUMN "repository_url";
  ALTER TABLE "projects" DROP COLUMN "order";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "experiences_id";`)
}
