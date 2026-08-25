import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ai_tools_kind" AS ENUM('skill', 'plugin', 'mcp');
  CREATE TABLE "ai_tools" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"kind" "enum_ai_tools_kind" DEFAULT 'skill' NOT NULL,
  	"description" varchar,
  	"snippet" varchar NOT NULL,
  	"url" varchar,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ai_tools_id" integer;
  CREATE INDEX "ai_tools_kind_idx" ON "ai_tools" USING btree ("kind");
  CREATE INDEX "ai_tools_active_idx" ON "ai_tools" USING btree ("active");
  CREATE INDEX "ai_tools_updated_at_idx" ON "ai_tools" USING btree ("updated_at");
  CREATE INDEX "ai_tools_created_at_idx" ON "ai_tools" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ai_tools_fk" FOREIGN KEY ("ai_tools_id") REFERENCES "public"."ai_tools"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_ai_tools_id_idx" ON "payload_locked_documents_rels" USING btree ("ai_tools_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ai_tools" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "ai_tools" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ai_tools_fk";
  
  DROP INDEX "payload_locked_documents_rels_ai_tools_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ai_tools_id";
  DROP TYPE "public"."enum_ai_tools_kind";`)
}
