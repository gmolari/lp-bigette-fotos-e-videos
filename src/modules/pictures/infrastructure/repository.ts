import "server-only";
import { eq, sql } from "drizzle-orm";
import type { Db } from "@/server/db/client";
import type { PictureRecord, PictureRepository } from "../domain/ports";
import { pictures } from "./schema";

const recordColumns = {
  id: pictures.id,
  storageKey: pictures.storageKey,
  url: pictures.url,
  alt: pictures.alt,
  width: pictures.width,
  height: pictures.height,
  sizeBytes: pictures.sizeBytes,
  mime: pictures.mime,
  position: pictures.position,
};

export function drizzlePictureRepository(db: Db): PictureRepository {
  return {
    async findById(id) {
      const [row] = await db.select(recordColumns).from(pictures).where(eq(pictures.id, id)).limit(1);
      return row ?? null;
    },

    async append(data): Promise<PictureRecord> {
      const [row] = await db
        .insert(pictures)
        .values({
          ...data,
          // ⚠️ Coluna em desuso desde a spec 006 (a ordem é por seção). Segue
          // preenchida só porque é NOT NULL; sai numa migration futura.
          position: sql`(select coalesce(max(${pictures.position}) + 1, 0) from ${pictures})`,
        })
        .returning(recordColumns);
      return row;
    },

    async delete(id) {
      await db.delete(pictures).where(eq(pictures.id, id));
    },
  };
}
