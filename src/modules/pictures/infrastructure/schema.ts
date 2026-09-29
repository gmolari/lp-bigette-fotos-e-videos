import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "../../users/infrastructure/schema";

/**
 * Sem `server-only`: o drizzle-kit lê este arquivo fora do Next.
 *
 * O arquivo em si mora no Vercel Blob; aqui fica o que a página precisa para
 * montar a foto SEM baixá-la: URL, texto alternativo e dimensões (a
 * proporção decide retrato × paisagem na grade e no varal 3D).
 */
export const pictures = pgTable(
  "pictures",
  {
    id: uuid().primaryKey().defaultRandom(),
    /**
     * Caminho do arquivo no armazenamento (ex.: "portfolio/<uuid>.jpg").
     * Neutro de provedor de propósito: o primeiro plano era o Imgur, que
     * fechou o registro de apps — trocar de novo não deve mexer no banco.
     */
    storageKey: text().notNull().unique(),
    /** URL pública do arquivo — é o que vai para o `<Image>` e para a textura 3D. */
    url: text().notNull(),
    /** Texto alternativo. É o que faz a foto aparecer no Google Imagens. */
    alt: text().notNull(),
    width: integer().notNull(),
    height: integer().notNull(),
    sizeBytes: integer().notNull(),
    mime: text().notNull(),
    /** Ordem na página, 0 primeiro. Reescrita inteira a cada reordenação. */
    position: integer().notNull(),
    /** Quem subiu. Excluir o usuário não apaga a foto. */
    createdBy: uuid().references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    check("pictures_dimensions_positive", sql`${t.width} > 0 AND ${t.height} > 0`),
    check("pictures_position_non_negative", sql`${t.position} >= 0`),
    check("pictures_alt_not_blank", sql`length(trim(${t.alt})) > 0`),
    index("pictures_position_idx").on(t.position),
  ],
).enableRLS();

export type PictureRow = typeof pictures.$inferSelect;
