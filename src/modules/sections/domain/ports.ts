import type { PictureRecord } from "../../pictures/domain/ports";
import type { SectionKey } from "./section";
import type { SectionVideo } from "./video";

/** Uma linha de atribuição: foto X na seção Y, na posição Z. */
export type Assignment = { section: SectionKey; pictureId: string; position: number };

export interface SectionRepository {
  /** O banco de fotos inteiro, mais novas primeiro. */
  listPictures(): Promise<PictureRecord[]>;
  /** Todas as atribuições, em ordem de seção e posição. */
  listAssignments(): Promise<Assignment[]>;
  /** Entram no FIM da seção, na ordem dada. As que já estão lá são ignoradas. */
  append(section: SectionKey, pictureIds: string[]): Promise<void>;
  remove(section: SectionKey, pictureId: string): Promise<void>;
  /** Reescreve a posição de todas as fotos da seção, na ordem dada. */
  reorder(section: SectionKey, pictureIds: string[]): Promise<void>;
  listVideos(): Promise<(SectionVideo & { section: SectionKey })[]>;
  /** Um vídeo por seção: grava por cima do anterior. */
  saveVideo(section: SectionKey, video: SectionVideo): Promise<void>;
  removeVideo(section: SectionKey): Promise<void>;
}

/** Confere no YouTube que o vídeo existe e é público; devolve o título. */
export interface VideoLookup {
  /** `null` = não existe, é privado ou não permite incorporar. */
  title(youtubeId: string): Promise<string | null>;
}
