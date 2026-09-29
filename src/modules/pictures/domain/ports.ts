import type { AcceptedMime } from "./picture";

/** Registro completo — só circula no servidor. */
export type PictureRecord = {
  id: string;
  storageKey: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  sizeBytes: number;
  mime: string;
  position: number;
};

export type NewPicture = Omit<PictureRecord, "id" | "position"> & { createdBy: string | null };

export interface PictureRepository {
  findById(id: string): Promise<PictureRecord | null>;
  append(data: NewPicture): Promise<PictureRecord>;
  /** Tira a foto de todas as seções junto (FK com ON DELETE CASCADE). */
  delete(id: string): Promise<void>;
}

/** O que a inspeção descobriu, com o arquivo já pronto para subir. */
export type InspectedImage = {
  bytes: Uint8Array;
  mime: AcceptedMime;
  width: number;
  height: number;
};

export interface ImageInspector {
  /**
   * Lê o arquivo de verdade (não confia no `type` que o navegador
   * mandou) e aplica a rotação do EXIF, para que largura × altura sejam
   * as da foto como ela é vista.
   */
  inspect(bytes: Uint8Array): Promise<InspectedImage>;
}

export type HostedImage = {
  /** Identifica o arquivo no armazenamento; é o que `delete` recebe. */
  key: string;
  url: string;
};

export interface ImageHost {
  upload(image: InspectedImage): Promise<HostedImage>;
  /** Idempotente: arquivo que já não existe não é erro. */
  delete(key: string): Promise<void>;
}
