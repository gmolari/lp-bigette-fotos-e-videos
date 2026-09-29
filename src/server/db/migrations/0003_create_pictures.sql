CREATE TABLE "pictures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" text NOT NULL,
	"url" text NOT NULL,
	"alt" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"size_bytes" integer NOT NULL,
	"mime" text NOT NULL,
	"position" integer NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pictures_storageKey_unique" UNIQUE("storage_key"),
	CONSTRAINT "pictures_dimensions_positive" CHECK ("pictures"."width" > 0 AND "pictures"."height" > 0),
	CONSTRAINT "pictures_position_non_negative" CHECK ("pictures"."position" >= 0),
	CONSTRAINT "pictures_alt_not_blank" CHECK (length(trim("pictures"."alt")) > 0)
);
--> statement-breakpoint
ALTER TABLE "pictures" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pictures" ADD CONSTRAINT "pictures_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pictures_position_idx" ON "pictures" USING btree ("position");