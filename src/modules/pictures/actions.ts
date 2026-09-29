"use server";

import { updateTag } from "next/cache";
import { createAction } from "@/server/action";
import { getDb } from "@/server/db/client";
import { logError, newErrorId } from "@/server/log";
import { removePicture, uploadPicture } from "./application/pictures";
import { PICTURES_CACHE_TAG } from "./cache";
import { pictureIdSchema, uploadPictureSchema } from "./domain/picture";
import { blobHost } from "./infrastructure/blob";
import { sharpInspector } from "./infrastructure/inspector";
import { drizzlePictureRepository } from "./infrastructure/repository";

const deps = () => ({
  pictures: drizzlePictureRepository(getDb()),
  inspector: sharpInspector,
  host: blobHost,
  warn: (action: string, error: unknown) =>
    logError({ errorId: newErrorId(), action, code: "UPSTREAM", error }),
});

/**
 * Toda escrita invalida o cache da landing page. `updateTag` e não
 * `revalidateTag`: quem acabou de subir uma foto vai abrir o site para
 * conferir, e precisa ver a foto nova — não a versão anterior servida
 * enquanto a nova é gerada em segundo plano.
 */
const publish = () => updateTag(PICTURES_CACHE_TAG);

// Todas com o guard padrão ("user"): na spec 003, /pictures é de admin e membro.

export const uploadPanelPicture = createAction(
  { name: "pictures.upload", input: uploadPictureSchema },
  async ({ file, alt }, { user }) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const picture = await uploadPicture(deps(), { bytes, alt, createdBy: user!.id });
    publish();
    return picture;
  },
);

export const deletePanelPicture = createAction(
  { name: "pictures.delete", input: pictureIdSchema },
  async ({ id }) => {
    await removePicture(deps(), id);
    publish();
    return null;
  },
);
