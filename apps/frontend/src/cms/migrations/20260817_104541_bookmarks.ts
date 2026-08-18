import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookmarks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"domain" varchar,
  	"preview_image_url" varchar,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookmarks_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "bookmarks_id" integer;
  ALTER TABLE "bookmarks_rels" ADD CONSTRAINT "bookmarks_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bookmarks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bookmarks_rels" ADD CONSTRAINT "bookmarks_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "tags_name_idx" ON "tags" USING btree ("name");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "bookmarks_url_idx" ON "bookmarks" USING btree ("url");
  CREATE INDEX "bookmarks_domain_idx" ON "bookmarks" USING btree ("domain");
  CREATE INDEX "bookmarks_active_idx" ON "bookmarks" USING btree ("active");
  CREATE INDEX "bookmarks_updated_at_idx" ON "bookmarks" USING btree ("updated_at");
  CREATE INDEX "bookmarks_created_at_idx" ON "bookmarks" USING btree ("created_at");
  CREATE INDEX "bookmarks_rels_order_idx" ON "bookmarks_rels" USING btree ("order");
  CREATE INDEX "bookmarks_rels_parent_idx" ON "bookmarks_rels" USING btree ("parent_id");
  CREATE INDEX "bookmarks_rels_path_idx" ON "bookmarks_rels" USING btree ("path");
  CREATE INDEX "bookmarks_rels_tags_id_idx" ON "bookmarks_rels" USING btree ("tags_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookmarks_fk" FOREIGN KEY ("bookmarks_id") REFERENCES "public"."bookmarks"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_bookmarks_id_idx" ON "payload_locked_documents_rels" USING btree ("bookmarks_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bookmarks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bookmarks_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "bookmarks" CASCADE;
  DROP TABLE "bookmarks_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tags_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_bookmarks_fk";
  
  DROP INDEX "payload_locked_documents_rels_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_bookmarks_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tags_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "bookmarks_id";`)
}
