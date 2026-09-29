import { panelContent } from "@/config/panel-content";
import { DomainError, FieldError } from "@/lib/action/result";
import type { ImageHost, ImageInspector, PictureRecord, PictureRepository } from "../domain/ports";
import { MIN_LONG_SIDE_PX, orientationOf, type Picture } from "../domain/picture";

const v = panelContent.pictures.validation;

export type PictureDeps = {
  pictures: PictureRepository;
  inspector: ImageInspector;
  host: ImageHost;
  /** Falha que não interrompe o fluxo, mas precisa ficar no log. */
  warn: (message: string, error: unknown) => void;
};

/**
 * Lista explícita do que sai do servidor. Coluna nova na tabela NÃO vaza
 * para o cliente até alguém adicioná-la aqui.
 */
export function toPublic(p: PictureRecord): Picture {
  return {
    id: p.id,
    url: p.url,
    alt: p.alt,
    width: p.width,
    height: p.height,
    sizeBytes: p.sizeBytes,
    orientation: orientationOf(p.width, p.height),
  };
}

/**
 * inspeciona → confere o piso de qualidade → sobe no armazenamento → grava.
 *
 * O armazenamento vem ANTES do banco porque é o banco que precisa do
 * link. Se a gravação falhar, o arquivo já está lá sem ninguém apontando
 * para ele — então é apagado de volta. Sem isso, cada erro de banco
 * deixaria uma foto órfã, pública e ocupando a cota grátis.
 */
export async function uploadPicture(
  deps: PictureDeps,
  input: { bytes: Uint8Array; alt: string; createdBy: string | null },
): Promise<Picture> {
  let image;
  try {
    image = await deps.inspector.inspect(input.bytes);
  } catch {
    throw new FieldError({ file: [v.fileUnreadable] });
  }

  if (Math.max(image.width, image.height) < MIN_LONG_SIDE_PX) {
    throw new FieldError({ file: [v.fileTooSmall] });
  }

  const hosted = await deps.host.upload(image);

  try {
    const record = await deps.pictures.append({
      storageKey: hosted.key,
      url: hosted.url,
      alt: input.alt,
      width: image.width,
      height: image.height,
      sizeBytes: image.bytes.byteLength,
      mime: image.mime,
      createdBy: input.createdBy,
    });
    return toPublic(record);
  } catch (e) {
    await deps.host
      .delete(hosted.key)
      .catch((err) => deps.warn(`storage: órfã ${hosted.key} não foi apagada`, err));
    throw e;
  }
}

/**
 * Banco primeiro, armazenamento depois. Na ordem inversa, uma falha do
 * banco deixaria a página apontando para uma imagem que não existe mais —
 * buraco visível no site. Assim, o pior caso é uma órfã no armazenamento,
 * que ninguém vê (e fica no log).
 */
export async function removePicture(deps: PictureDeps, id: string): Promise<void> {
  const picture = await deps.pictures.findById(id);
  if (!picture) throw new DomainError(v.notFound);

  await deps.pictures.delete(id);
  await deps.host
    .delete(picture.storageKey)
    .catch((err) => deps.warn(`storage: ${picture.storageKey} saiu do banco mas não do armazenamento`, err));
}

