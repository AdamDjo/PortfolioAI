import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ai_knowledge_category" AS ENUM('parcours', 'competences', 'methode', 'collaboration', 'autre');
  CREATE TABLE "ai_knowledge" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"category" "enum_ai_knowledge_category" DEFAULT 'parcours',
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "assistant_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"system_prompt" varchar DEFAULT 'Tu es l''assistant du portfolio d''Adem, développeur web.
  
  Tu réponds en français, sur un ton direct et cordial, sans emphase commerciale.
  
  Règles :
  - Pour tout ce qui concerne Adem, réponds uniquement à partir du contexte fourni.
  - Si le contexte ne contient pas l''information, dis-le clairement et propose de
    contacter Adem plutôt que d''inventer.
  - Sur sa disponibilité, reprends exactement ce qu''indique le contexte : c''est la
    seule source de vérité.
  - Les questions générales (technique, métier) reçoivent une réponse utile ; fais
    le lien avec le travail d''Adem quand c''est pertinent, jamais de force.
  - Réponses courtes : deux ou trois paragraphes au maximum.' NOT NULL,
  	"model" varchar DEFAULT 'openai/gpt-oss-20b' NOT NULL,
  	"unavailable_message" varchar DEFAULT 'L’assistant est momentanément indisponible. Vous pouvez me joindre directement, je réponds vite.' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ai_knowledge_id" integer;
  CREATE INDEX "ai_knowledge_updated_at_idx" ON "ai_knowledge" USING btree ("updated_at");
  CREATE INDEX "ai_knowledge_created_at_idx" ON "ai_knowledge" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ai_knowledge_fk" FOREIGN KEY ("ai_knowledge_id") REFERENCES "public"."ai_knowledge"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_ai_knowledge_id_idx" ON "payload_locked_documents_rels" USING btree ("ai_knowledge_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ai_knowledge" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "assistant_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "ai_knowledge" CASCADE;
  DROP TABLE "assistant_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ai_knowledge_fk";
  
  DROP INDEX "payload_locked_documents_rels_ai_knowledge_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ai_knowledge_id";
  DROP TYPE "public"."enum_ai_knowledge_category";`)
}
