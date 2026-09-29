import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { Db } from "@/server/db/client";
// Exceção consciente: a seção precisa das colunas da foto (url, alt,
// dimensões) numa ida só ao banco.
import { pictures } from "../../pictures/infrastructure/schema";
import type { SectionRepository } from "../domain/ports";
import { sectionPictures, sectionVideos } from "./schema";

const pictureColumns = {
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

const ids = (list: string[]) =>
  sql.join(
    list.map((id) => sql`${id}`),
    sql`, `,
  );

export function drizzleSectionRepository(db: Db): SectionRepository {
  return {
    listPictures() {
      return db.select(pictureColumns).from(pictures).orderBy(desc(pictures.createdAt));
    },

    listAssignments() {
      return db
        .select({
          section: sectionPictures.section,
          pictureId: sectionPictures.pictureId,
          position: sectionPictures.position,
        })
        .from(sectionPictures)
        .orderBy(asc(sectionPictures.section), asc(sectionPictures.position), asc(sectionPictures.createdAt));
    },

    /**
     * Uma instrução só: as posições saem de `max + ordinalidade`, e
     * `on conflict do nothing` ignora quem já está na seção (a chave
     * primária é seção + foto).
     */
    async append(section, pictureIds) {
      if (pictureIds.length === 0) return;
      await db.execute(sql`
        insert into ${sectionPictures} (section, picture_id, position)
        select ${section}, o.id,
               (select coalesce(max(position), -1) from ${sectionPictures} where section = ${section}) + o.ord
        from unnest(array[${ids(pictureIds)}]::uuid[]) with ordinality as o(id, ord)
        on conflict do nothing
      `);
    },

    async remove(section, pictureId) {
      await db
        .delete(sectionPictures)
        .where(and(eq(sectionPictures.section, section), eq(sectionPictures.pictureId, pictureId)));
    },

    /** Um UPDATE só, com a ordem num array (ver pictures, spec 005). */
    async reorder(section, pictureIds) {
      if (pictureIds.length === 0) return;
      await db.execute(sql`
        update ${sectionPictures}
        set position = o.ord - 1
        from unnest(array[${ids(pictureIds)}]::uuid[]) with ordinality as o(id, ord)
        where ${sectionPictures.section} = ${section} and ${sectionPictures.pictureId} = o.id
      `);
    },

    listVideos() {
      return db
        .select({
          section: sectionVideos.section,
          youtubeId: sectionVideos.youtubeId,
          format: sectionVideos.format,
          title: sectionVideos.title,
        })
        .from(sectionVideos);
    },

    async saveVideo(section, video) {
      await db
        .insert(sectionVideos)
        .values({ section, ...video })
        .onConflictDoUpdate({ target: sectionVideos.section, set: { ...video, updatedAt: new Date() } });
    },

    async removeVideo(section) {
      await db.delete(sectionVideos).where(eq(sectionVideos.section, section));
    },
  };
}
