import "server-only";
import sharp from "sharp";
import type { ImageInspector } from "../domain/ports";
import type { AcceptedMime } from "../domain/picture";

const MIME_BY_FORMAT: Record<string, AcceptedMime> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Inspeção com sharp — o mesmo que o Next usa para otimizar imagem, então
 * não é dependência nova no servidor.
 *
 * O formato vem dos BYTES, não do `type` que o navegador declarou: um
 * .gif renomeado para .jpg é recusado aqui.
 *
 * Foto de celular costuma vir deitada no arquivo com uma etiqueta EXIF
 * dizendo "gire 90°". Sem tratar isso, largura e altura saem trocadas e
 * a foto em pé vira paisagem na grade e no varal. Só nesse caso a
 * imagem é regravada (girada de verdade, qualidade alta); no resto, os
 * bytes originais sobem intactos — recomprimir uma foto boa só piora.
 */
export const sharpInspector: ImageInspector = {
  async inspect(bytes) {
    const meta = await sharp(bytes).metadata();
    const mime = meta.format ? MIME_BY_FORMAT[meta.format] : undefined;
    if (!mime || !meta.width || !meta.height) throw new Error(`formato não aceito: ${meta.format}`);

    // 1 = já está em pé; ausente = sem EXIF. De 2 a 8, precisa girar/espelhar.
    if (!meta.orientation || meta.orientation === 1) {
      return { bytes, mime, width: meta.width, height: meta.height };
    }

    const pipeline = sharp(bytes).rotate();
    const encoded =
      mime === "image/png"
        ? pipeline.png()
        : mime === "image/webp"
          ? pipeline.webp({ quality: 92 })
          : pipeline.jpeg({ quality: 92, mozjpeg: true });

    const { data, info } = await encoded.toBuffer({ resolveWithObject: true });
    return { bytes: new Uint8Array(data), mime, width: info.width, height: info.height };
  },
};
