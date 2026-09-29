CREATE TYPE "public"."page_section" AS ENUM('hero', 'portfolio', 'closing');--> statement-breakpoint
CREATE TABLE "section_pictures" (
	"section" "page_section" NOT NULL,
	"picture_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "section_pictures_section_picture_id_pk" PRIMARY KEY("section","picture_id"),
	CONSTRAINT "section_pictures_position_non_negative" CHECK ("section_pictures"."position" >= 0)
);
--> statement-breakpoint
ALTER TABLE "section_pictures" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "section_pictures" ADD CONSTRAINT "section_pictures_picture_id_pictures_id_fk" FOREIGN KEY ("picture_id") REFERENCES "public"."pictures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "section_pictures_order_idx" ON "section_pictures" USING btree ("section","position");--> statement-breakpoint
-- ⚠️ Escrito à mão (spec 006). Antes desta migration a LP mostrava TODAS as
-- fotos do banco, na ordem de `pictures.position`, no varal e nas polaroides.
-- Sem isto as seções nasceriam vazias e o site trocaria as fotos pelas
-- provisórias no instante do deploy. O banner nunca usou o banco: fica vazio.
INSERT INTO "section_pictures" ("section", "picture_id", "position")
SELECT s.section, p.id, row_number() OVER (PARTITION BY s.section ORDER BY p.position, p.created_at) - 1
FROM "pictures" p
CROSS JOIN (VALUES ('portfolio'::page_section), ('closing'::page_section)) AS s(section);
