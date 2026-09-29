import { readPictureFile } from "@/modules/pictures";

/**
 * Entrega as fotos do portfólio, que moram num Blob Store PRIVADO.
 *
 * ⚠️ Exceção consciente à regra "nada de route handler para dado
 * próprio": isto não é dado para o cliente, é ARQUIVO — e server action
 * não serve arquivo por URL. Quem chama é quase só o /_next/image, uma
 * vez por largura; ele guarda o resultado por 30 dias.
 *
 * Cache longo e imutável: a chave tem um uuid, então o conteúdo de uma
 * URL nunca muda. `s-maxage` deixa o CDN da Vercel responder no lugar da
 * função depois da primeira vez.
 *
 * Spec: .claude/specs/005-portfolio-pictures.md
 */
const CACHE = "public, max-age=31536000, s-maxage=31536000, immutable";

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const key = (await params).path.join("/");

  let file;
  try {
    file = await readPictureFile(key, request.headers.get("if-none-match") ?? undefined);
  } catch (e) {
    console.error(`[media] falha ao ler ${key}: ${String(e)}`);
    return new Response(null, { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  if (!file) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });

  const headers = new Headers({ "Cache-Control": CACHE, ETag: file.blob.etag });
  if (file.statusCode === 304) return new Response(null, { status: 304, headers });

  headers.set("Content-Type", file.blob.contentType);
  headers.set("Content-Length", String(file.blob.size));
  return new Response(file.stream, { status: 200, headers });
}
