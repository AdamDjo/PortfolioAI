import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_conversations_feedback" AS ENUM('useful', 'not_useful');
  CREATE TABLE "conversations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"conversation_id" varchar NOT NULL,
  	"fingerprint" varchar,
  	"transcript" jsonb,
  	"feedback" "enum_conversations_feedback",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "conversations_id" integer;
  ALTER TABLE "assistant_settings" ADD COLUMN "retention_notice" varchar DEFAULT 'Les échanges sont conservés 30 jours de façon anonyme pour améliorer l’assistant.' NOT NULL;
  CREATE UNIQUE INDEX "conversations_conversation_id_idx" ON "conversations" USING btree ("conversation_id");
  CREATE INDEX "conversations_updated_at_idx" ON "conversations" USING btree ("updated_at");
  CREATE INDEX "conversations_created_at_idx" ON "conversations" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_conversations_fk" FOREIGN KEY ("conversations_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_conversations_id_idx" ON "payload_locked_documents_rels" USING btree ("conversations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "conversations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "conversations" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_conversations_fk";
  
  DROP INDEX "payload_locked_documents_rels_conversations_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "conversations_id";
  ALTER TABLE "assistant_settings" DROP COLUMN "retention_notice";
  DROP TYPE "public"."enum_conversations_feedback";`)
}
