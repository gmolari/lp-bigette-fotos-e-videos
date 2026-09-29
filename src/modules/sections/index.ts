import "server-only";
import { unstable_cache } from "next/cache";
import { getDb } from "@/server/db/client";
import { PICTURES_CACHE_TAG } from "../pictures/cache";
import { getPublished } from "./application/sections";
import { drizzleSectionRepository } from "./infrastructure/repository";

/** Fachada para Server Components. Actions ficam em `./actions`. */

/**
 * As fotos (e o vídeo) de cada seção, em ordem, lidas NO SERVIDOR durante o render
 * da landing page.
 *
 * Em cache até uma action invalidar a tag — a página continua estática:
 * o banco é consultado uma vez por mudança no painel, não por visita.
 *
 * `unstable_cache`, não `"use cache"`: a diretiva exige ligar
 * `cacheComponents` no app inteiro, e o painel lê cookie em toda tela.
 */
export const getPublishedSections = unstable_cache(
  async () => getPublished({ sections: drizzleSectionRepository(getDb()) }),
  ["sections:published"],
  { tags: [PICTURES_CACHE_TAG] },
);
