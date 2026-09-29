import "server-only";
import { content } from "@/config/content";
import type { FotoPortfolio, VideoDaPagina } from "@/lib/portfolio-tipos";
import type { Picture } from "@/modules/pictures/domain/picture";
import { getPublishedSections } from "@/modules/sections";
import { SECTION_RULES, resolveSection } from "@/modules/sections/domain/section";
import { youTubeThumbnail } from "@/modules/sections/domain/video";

export type FotosDasSecoes = {
  /** A foto de fundo do banner. */
  hero: FotoPortfolio;
  /** O varal 3D (e a grade, sem 3D). */
  portfolio: FotoPortfolio[];
  /** O anel de polaroides do fecho. */
  closing: FotoPortfolio[];
  /** A foto da Bigette. `null` → espaço reservado (nunca um rosto qualquer). */
  about: FotoPortfolio | null;
  /** O vídeo do YouTube, com capa. `null` sem link. */
  video: VideoDaPagina | null;
  /** A capa sozinha, quando há capa mas não há vídeo. */
  capaSemVideo: FotoPortfolio | null;
};

const paraFoto = (p: Picture): FotoPortfolio => ({
  src: p.url,
  alt: p.alt,
  formato: p.orientation === "landscape" ? "paisagem" : "retrato",
});

/** As provisórias: o que a página mostrava antes do painel existir. */
const RESERVA = {
  hero: [{ src: content.hero.foto, alt: content.hero.fotoAlt, formato: "paisagem" }] as FotoPortfolio[],
  galeria: [...content.sala.fotos] as FotoPortfolio[],
};

/**
 * As fotos (e o vídeo) de cada seção, montados no servidor.
 *
 * Cada seção segue `resolveSection` (spec 006): vazia → provisórias;
 * de 1 a 3 → as dela uma vez cada, completadas com provisórias; a partir
 * de 4 → só as dela, repetindo para preencher os lugares. Sobre e vídeo
 * não têm provisória (spec 007): vazios, mostram o espaço reservado.
 *
 * Banco fora do alcance (ou build sem credenciais) → tudo provisório: a
 * página nunca sobe sem imagem.
 */
export async function fotosDasSecoes(): Promise<FotosDasSecoes> {
  let publicado: Awaited<ReturnType<typeof getPublishedSections>> | null = null;
  try {
    publicado = await getPublishedSections();
  } catch (e) {
    console.warn(`[portfolio] banco indisponível, usando as fotos provisórias: ${String(e)}`);
  }

  const s = publicado?.sections;
  const da = (lista: Picture[] | undefined) => (lista ?? []).map(paraFoto);
  return {
    hero: resolveSection(da(s?.hero), RESERVA.hero, SECTION_RULES.hero.slots)[0],
    portfolio: resolveSection(da(s?.portfolio), RESERVA.galeria, SECTION_RULES.portfolio.slots),
    closing: resolveSection(da(s?.closing), RESERVA.galeria, SECTION_RULES.closing.slots),
    about: da(s?.about)[0] ?? null,
    ...montarVideo(publicado?.videos.video, da(s?.video)[0] ?? null),
  };
}

function montarVideo(
  video: { youtubeId: string; format: "landscape" | "vertical"; title: string } | undefined,
  capa: FotoPortfolio | null,
): Pick<FotosDasSecoes, "video" | "capaSemVideo"> {
  if (!video) return { video: null, capaSemVideo: capa };
  return {
    video: {
      youtubeId: video.youtubeId,
      vertical: video.format === "vertical",
      titulo: video.title,
      // Sem capa escolhida: a miniatura do YouTube (i.ytimg.com, liberado
      // no otimizador). O alt vazio é de propósito — o botão tem rótulo.
      capa: capa ?? { src: youTubeThumbnail(video.youtubeId), alt: "", formato: "paisagem" },
    },
    capaSemVideo: null,
  };
}
