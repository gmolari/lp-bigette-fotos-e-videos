import "server-only";
import { getPublishedSectionTexts } from "@/modules/sections";
import { DEFAULT_TEXTS, type SectionTexts } from "@/modules/sections/domain/texts";
import { describeCause } from "@/server/errors";

/**
 * Os textos das seções que o painel pode alterar (/sections, spec 008),
 * já resolvidos no servidor: o padrão de `content.ts` + o que foi
 * personalizado.
 *
 * Banco fora do alcance, build sem credenciais ou migration ainda não
 * aplicada → os textos padrão. A página nunca sobe sem texto.
 */
export async function getPageTexts(): Promise<SectionTexts> {
  try {
    return await getPublishedSectionTexts();
  } catch (e) {
    console.warn(`[page-texts] textos não lidos, usando os padrão — causa: ${describeCause(e)}`);
    return DEFAULT_TEXTS;
  }
}
