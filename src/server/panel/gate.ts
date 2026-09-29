/**
 * Portão do painel: as rotas escondidas só existem para quem entrou
 * pelo link especial (`/login?access=<PANEL_ACCESS_KEY>`).
 *
 * Sem `server-only` de propósito: usado pelo `proxy.ts`, que não roda
 * na camada de React Server. Só Web Crypto — nada de `node:crypto`.
 *
 * O cookie NÃO guarda a chave: guarda um HMAC dela. Vazar o cookie não
 * vaza o link, e trocar a chave invalida todos os cookies de uma vez.
 */

export const GATE_COOKIE = "bgt_gate";
export const ACCESS_PARAM = "access";
/** 30 dias. Depois disso, precisa do link de novo. */
export const GATE_MAX_AGE = 60 * 60 * 24 * 30;

const MIN_KEY_LENGTH = 32;
const MESSAGE = "bgt-gate-v1";

/** A chave do ambiente, ou null se ausente/fraca (→ painel inexistente). */
export function getGateKey(): string | null {
  const key = process.env.PANEL_ACCESS_KEY?.trim();
  return key && key.length >= MIN_KEY_LENGTH ? key : null;
}

async function hmac(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(message));
  return Array.from(new Uint8Array(sig), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

/** Comparação em tempo constante — não vaza por timing quantos caracteres batem. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Valor que vai no cookie para esta chave. */
export function gateToken(key: string): Promise<string> {
  return hmac(key, MESSAGE);
}

/** O `?access=` recebido é a chave? Compara HMACs, que têm tamanho fixo. */
export async function accessKeyMatches(received: string, key: string) {
  const [a, b] = await Promise.all([hmac(received, MESSAGE), gateToken(key)]);
  return safeEqual(a, b);
}

/** O cookie recebido abre o portão? */
export async function gateCookieMatches(value: string | undefined, key: string) {
  if (!value) return false;
  return safeEqual(value, await gateToken(key));
}
