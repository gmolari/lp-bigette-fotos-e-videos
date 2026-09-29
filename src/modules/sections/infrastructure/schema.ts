import { sql } from "drizzle-orm";
import { check, index, integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pictures } from "../../pictures/infrastructure/schema";

/**
 * Sem `server-only`: o drizzle-kit lê este arquivo fora do Next.
 *
 * Qual foto do banco aparece em qual seção, e em que ordem. A mesma foto
 * pode estar em mais de uma seção (ex.: no varal e nas polaroides).
 */

/**
 * Valores novos entram SEMPRE NO FIM: no Postgres, inserir no meio de um
 * enum exige recriar o tipo. A ordem de exibição é `SECTION_KEYS`, não esta.
 */
export const pageSection = pgEnum("page_section", ["hero", "portfolio", "closing", "video", "about"]);

export const sectionPictures = pgTable(
  "section_pictures",
  {
    section: pageSection().notNull(),
    /** Excluir a foto do banco tira ela de todas as seções. */
    pictureId: uuid()
      .notNull()
      .references(() => pictures.id, { onDelete: "cascade" }),
    /** Ordem dentro da seção, 0 primeiro. Reescrita inteira a cada reordenação. */
    position: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // A mesma foto não entra duas vezes na MESMA seção
    primaryKey({ columns: [t.section, t.pictureId] }),
    check("section_pictures_position_non_negative", sql`${t.position} >= 0`),
    index("section_pictures_order_idx").on(t.section, t.position),
  ],
).enableRLS();

export const videoFormat = pgEnum("video_format", ["landscape", "vertical"]);

/**
 * Vídeo de uma seção, por LINK do YouTube — nada é hospedado aqui. Um por
 * seção (chave primária). Hoje só a seção "video" usa.
 */
export const sectionVideos = pgTable(
  "section_videos",
  {
    section: pageSection().primaryKey(),
    /** Os 11 caracteres do id do YouTube. */
    youtubeId: text().notNull(),
    format: videoFormat().notNull(),
    /** Título do YouTube (oEmbed), para o `title` do iframe. */
    title: text().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [check("section_videos_youtube_id_format", sql`${t.youtubeId} ~ '^[A-Za-z0-9_-]{11}$'`)],
).enableRLS();
