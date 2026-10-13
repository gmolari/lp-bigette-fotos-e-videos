CREATE TABLE "section_texts" (
	"section" text PRIMARY KEY NOT NULL,
	"content" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "section_texts" ENABLE ROW LEVEL SECURITY;