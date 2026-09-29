import "server-only";
import { STORAGE_KEY_PATTERN } from "./domain/picture";
import { readBlobPicture } from "./infrastructure/blob";

/** Fachada para Server Components. Actions ficam em `./actions`. */

/**
 * O arquivo de uma foto, para a rota `/media`. Recusa (null) qualquer
 * chave fora do formato gerado pelo upload — a rota não vira leitor
 * genérico do store.
 */
export async function readPictureFile(key: string, ifNoneMatch?: string) {
  if (!STORAGE_KEY_PATTERN.test(key)) return null;
  return readBlobPicture(key, ifNoneMatch);
}
