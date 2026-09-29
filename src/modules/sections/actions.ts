"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { createAction } from "@/server/action";
import { getDb } from "@/server/db/client";
import { PICTURES_CACHE_TAG } from "../pictures/cache";
import {
  assignPictures,
  clearSectionVideo,
  getBoard,
  reorderSection,
  setSectionVideo,
  unassignPicture,
} from "./application/sections";
import { assignPicturesSchema, reorderSectionSchema, unassignPictureSchema } from "./domain/section";
import { setVideoSchema } from "./domain/video";
import { drizzleSectionRepository } from "./infrastructure/repository";
import { youTubeLookup } from "./infrastructure/youtube";

const deps = () => ({ sections: drizzleSectionRepository(getDb()) });

/**
 * Toda escrita invalida o cache da landing page (a mesma tag das fotos:
 * a LP lê as duas coisas numa consulta só). `updateTag`: quem mexeu vai
 * abrir o site para conferir.
 */
const publish = () => updateTag(PICTURES_CACHE_TAG);

// Guard padrão ("user"): na spec 003, /pictures e /sections são de admin e membro.

/** Banco de fotos + seções, numa ida só. Usado por /pictures e /sections. */
export const getSectionsBoard = createAction({ name: "sections.board", input: z.void() }, async () =>
  getBoard(deps()),
);

export const assignSectionPictures = createAction(
  { name: "sections.assign", input: assignPicturesSchema },
  async ({ section, pictureIds }) => {
    const board = await assignPictures(deps(), section, pictureIds);
    publish();
    return board;
  },
);

export const unassignSectionPicture = createAction(
  { name: "sections.unassign", input: unassignPictureSchema },
  async ({ section, pictureId }) => {
    const board = await unassignPicture(deps(), section, pictureId);
    publish();
    return board;
  },
);

export const reorderSectionPictures = createAction(
  { name: "sections.reorder", input: reorderSectionSchema },
  async ({ section, pictureIds }) => {
    const board = await reorderSection(deps(), section, pictureIds);
    publish();
    return board;
  },
);

// ── Vídeo ─────────────────────────────────────────────────────────
// Só a seção "video" tem vídeo; o input nem pergunta qual.

export const saveSectionVideo = createAction(
  { name: "sections.video.save", input: setVideoSchema },
  async (data) => {
    const board = await setSectionVideo({ ...deps(), lookup: youTubeLookup }, "video", data);
    publish();
    return board;
  },
);

export const removeSectionVideo = createAction(
  { name: "sections.video.remove", input: z.void() },
  async () => {
    const board = await clearSectionVideo(deps(), "video");
    publish();
    return board;
  },
);
