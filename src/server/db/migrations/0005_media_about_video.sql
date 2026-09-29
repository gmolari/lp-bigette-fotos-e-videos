CREATE TYPE "public"."video_format" AS ENUM('landscape', 'vertical');--> statement-breakpoint
ALTER TYPE "public"."page_section" ADD VALUE 'video';--> statement-breakpoint
ALTER TYPE "public"."page_section" ADD VALUE 'about';--> statement-breakpoint
CREATE TABLE "section_videos" (
	"section" "page_section" PRIMARY KEY NOT NULL,
	"youtube_id" text NOT NULL,
	"format" "video_format" NOT NULL,
	"title" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "section_videos_youtube_id_format" CHECK ("section_videos"."youtube_id" ~ '^[A-Za-z0-9_-]{11}$')
);
--> statement-breakpoint
ALTER TABLE "section_videos" ENABLE ROW LEVEL SECURITY;