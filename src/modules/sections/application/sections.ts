import { panelContent } from "@/config/panel-content";
import { DomainError, FieldError } from "@/lib/action/result";
import { toPublic } from "../../pictures/application/pictures";
import type { Picture } from "../../pictures/domain/picture";
import type { SectionRepository, VideoLookup } from "../domain/ports";
import { SECTION_KEYS, type SectionKey } from "../domain/section";
import { resolveTexts, type ResolvedTexts, type SaveTextInput, type SectionTexts, type TextSectionKey } from "../domain/texts";
import { parseYouTubeUrl, type SectionVideo, type VideoFormat } from "../domain/video";

const v = panelContent.sections.validation;
const vv = panelContent.sections.video.validation;

export type SectionDeps = { sections: SectionRepository };

export type Sections = Record<SectionKey, Picture[]>;

/** Foto do banco + em quais seções ela está (para avisar antes de excluir). */
export type BankPicture = Picture & { usedIn: SectionKey[] };

/**
 * Tudo que as duas telas do painel precisam, numa action só — o Next
 * despacha actions em fila, então duas consultas seriam duas esperas.
 */
export type Board = { sections: Sections; videos: Videos; bank: BankPicture[]; texts: ResolvedTexts };

/** Vídeo de cada seção que tem um (hoje só "video"). */
export type Videos = Partial<Record<SectionKey, SectionVideo>>;

/** O que a landing page precisa. */
export type Published = { sections: Sections; videos: Videos };

function emptySections(): Sections {
  return Object.fromEntries(SECTION_KEYS.map((k) => [k, []])) as unknown as Sections;
}

/** Fotos e vídeos, sem os textos — o que a landing page lê para as imagens. */
async function loadMedia(deps: SectionDeps): Promise<Omit<Board, "texts">> {
  const [records, assignments, videoRows] = await Promise.all([
    deps.sections.listPictures(),
    deps.sections.listAssignments(),
    deps.sections.listVideos(),
  ]);

  const byId = new Map(records.map((r) => [r.id, toPublic(r)]));
  const sections = emptySections();
  const usedIn = new Map<string, SectionKey[]>();

  for (const a of assignments) {
    const picture = byId.get(a.pictureId);
    if (!picture) continue;
    sections[a.section].push(picture);
    usedIn.set(a.pictureId, [...(usedIn.get(a.pictureId) ?? []), a.section]);
  }

  const bank = records.map((r) => ({ ...byId.get(r.id)!, usedIn: usedIn.get(r.id) ?? [] }));
  const videos: Videos = Object.fromEntries(
    videoRows.map(({ section, ...video }) => [section, video]),
  );
  return { sections, videos, bank };
}

export async function getBoard(deps: SectionDeps): Promise<Board> {
  const [media, textRows] = await Promise.all([loadMedia(deps), deps.sections.listTexts()]);
  return { ...media, texts: resolveTexts(textRows) };
}

/**
 * Só as fotos e o vídeo que a landing page mostra. NÃO lê os textos: são
 * consultas separadas para que uma falhar não derrube a outra.
 */
export async function getPublished(deps: SectionDeps): Promise<Published> {
  const { sections, videos } = await loadMedia(deps);
  return { sections, videos };
}

export async function assignPictures(deps: SectionDeps, section: SectionKey, pictureIds: string[]) {
  const known = new Set((await deps.sections.listPictures()).map((p) => p.id));
  if (!pictureIds.every((id) => known.has(id))) throw new DomainError(v.pictureGone);
  await deps.sections.append(section, [...new Set(pictureIds)]);
  return getBoard(deps);
}

export async function unassignPicture(deps: SectionDeps, section: SectionKey, pictureId: string) {
  await deps.sections.remove(section, pictureId);
  return getBoard(deps);
}

/**
 * A ordem chega INTEIRA. Se o conjunto não bate com o que a seção tem
 * (outra aba mexeu), recusa em vez de adivinhar.
 */
export async function reorderSection(deps: SectionDeps, section: SectionKey, pictureIds: string[]) {
  const current = (await deps.sections.listAssignments()).filter((a) => a.section === section);
  const known = new Set(current.map((a) => a.pictureId));
  const sameSet =
    pictureIds.length === known.size &&
    new Set(pictureIds).size === pictureIds.length &&
    pictureIds.every((id) => known.has(id));
  if (!sameSet) throw new DomainError(v.orderOutdated);

  await deps.sections.reorder(section, pictureIds);
  return getBoard(deps);
}

/**
 * Grava o vídeo de uma seção a partir do LINK colado. Confere no YouTube
 * (oEmbed) antes: link de vídeo privado, apagado ou sem incorporação
 * seria um quadro preto na página.
 */
export async function setSectionVideo(
  deps: SectionDeps & { lookup: VideoLookup },
  section: SectionKey,
  input: { url: string; format: VideoFormat },
) {
  const parsed = parseYouTubeUrl(input.url);
  if (!parsed) throw new FieldError({ url: [vv.urlInvalid] });

  const title = await deps.lookup.title(parsed.id);
  if (!title) throw new FieldError({ url: [vv.notFound] });

  await deps.sections.saveVideo(section, { youtubeId: parsed.id, format: input.format, title });
  return getBoard(deps);
}

export async function clearSectionVideo(deps: SectionDeps, section: SectionKey) {
  await deps.sections.removeVideo(section);
  return getBoard(deps);
}

/**
 * Os textos como a landing page os mostra: padrão + personalizado.
 * Separado de `getPublished` de propósito — se esta leitura falhar, a
 * página cai nos textos padrão sem perder as fotos junto.
 */
export async function getPublishedTexts(deps: SectionDeps): Promise<SectionTexts> {
  return resolveTexts(await deps.sections.listTexts()).texts;
}

/** Grava o conteúdo inteiro da seção (já validado pelo esquema dela). */
export async function saveSectionText(deps: SectionDeps, input: SaveTextInput) {
  await deps.sections.saveText(input.section, input.content);
  return getBoard(deps);
}

/** A seção volta ao texto padrão de `content.ts`. */
export async function resetSectionText(deps: SectionDeps, section: TextSectionKey) {
  await deps.sections.removeText(section);
  return getBoard(deps);
}
