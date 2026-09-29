import "server-only";
import { randomUUID } from "node:crypto";
import {
  BlobAccessError,
  BlobError,
  BlobNotFoundError,
  BlobServiceRateLimited,
  BlobStoreNotFoundError,
  BlobStoreSuspendedError,
  del,
  get,
  put,
} from "@vercel/blob";
import { panelContent } from "@/config/panel-content";
import { ConfigError, UpstreamError } from "@/lib/action/result";
import { blobEnv } from "@/server/env";
import type { ImageHost } from "../domain/ports";
import { mediaUrl, type AcceptedMime } from "../domain/picture";

/**
 * Vercel Blob, store PRIVADO. Escolhido depois que o Imgur fechou o
 * registro de apps novos (spec 005).
 *
 * Privado = o original não tem URL aberta. Quem entrega é a rota
 * `/media/[...path]` (lendo com `readBlobPicture`), e quem a consulta é
 * o /_next/image, uma vez por largura. Vantagem sobre o público: o
 * original (com EXIF, inclusive GPS) nunca fica exposto.
 *
 * Plano Hobby: 1 GB, 10 GB de tráfego e 2.000 envios por mês. Estourou,
 * o store é SUSPENSO por 30 dias — nunca cobra. A suspensão chega aqui
 * como `BlobStoreSuspendedError` e vira mensagem própria.
 *
 * O visitante quase não toca no Blob: grade e texturas 3D passam por
 * /_next/image, que guarda a versão otimizada por 30 dias.
 */

const t = panelContent.pictures.upstream;

const EXTENSION: Record<AcceptedMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Um ano. O caminho tem um uuid, então o conteúdo de uma URL nunca muda. */
const CACHE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Erro do SDK → erro do projeto. Token errado ou store apagado é
 * configuração (alguém precisa ajustar o ambiente); limite, suspensão
 * e queda são do serviço de fora.
 */
function translate(e: unknown, what: string): never {
  if (e instanceof BlobAccessError || e instanceof BlobStoreNotFoundError) {
    throw new ConfigError(`vercel-blob: ${what}: ${e.message} — confira BLOB_STORE_ID / BLOB_READ_WRITE_TOKEN`);
  }
  // OIDC sem token: no local, faltou `vercel env pull`
  if (e instanceof BlobError && e.message.includes("No blob credentials")) {
    throw new ConfigError(`vercel-blob: ${what}: ${e.message} — rode \`vercel env pull\``);
  }
  if (e instanceof BlobStoreSuspendedError) {
    throw new UpstreamError("vercel-blob", `${what}: ${e.message}`, t.suspended, { cause: e });
  }
  if (e instanceof BlobServiceRateLimited) {
    throw new UpstreamError("vercel-blob", `${what}: ${e.message}`, t.rateLimited, { cause: e });
  }
  // Rede, indisponibilidade ou qualquer outro: sem isto, ECONNRESET seria
  // lido como "banco fora do ar"
  const message = e instanceof BlobError || e instanceof Error ? e.message : String(e);
  throw new UpstreamError("vercel-blob", `${what}: ${message}`, undefined, { cause: e });
}

export const blobHost: ImageHost = {
  async upload(image) {
    const { token } = blobEnv();
    const pathname = `portfolio/${randomUUID()}.${EXTENSION[image.mime]}`;
    try {
      const blob = await put(pathname, Buffer.from(image.bytes), {
        access: "private",
        contentType: image.mime,
        cacheControlMaxAge: CACHE_SECONDS,
        token,
      });
      return { key: blob.pathname, url: mediaUrl(blob.pathname) };
    } catch (e) {
      translate(e, "upload");
    }
  },

  async delete(key) {
    const { token } = blobEnv();
    try {
      await del(key, { token });
    } catch (e) {
      // Já não existe: o objetivo foi atingido
      if (e instanceof BlobNotFoundError) return;
      translate(e, "delete");
    }
  },
};

/**
 * Lê um arquivo do store privado para a rota `/media`. `null` = não
 * existe. Com `ifNoneMatch` igual ao ETag atual, volta 304 sem corpo.
 */
export async function readBlobPicture(key: string, ifNoneMatch?: string) {
  const { token } = blobEnv();
  try {
    return await get(key, { access: "private", token, ifNoneMatch });
  } catch (e) {
    if (e instanceof BlobNotFoundError) return null;
    translate(e, "read");
  }
}
