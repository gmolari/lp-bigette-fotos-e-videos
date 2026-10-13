/**
 * REFRESH TOKEN: opaco, aleatório, de uso único.
 *
 * Não é JWT de propósito. JWT serve para ser conferido SEM ir ao banco;
 * o refresh precisa do banco de qualquer jeito (uso único, revogação),
 * então um segredo aleatório é mais simples e não carrega nada legível.
 *
 * Formato do cookie: `<id da sessão>.<segredo>`. O id acha a linha; o
 * banco guarda só o SHA-256 do segredo — vazar o banco não entrega
 * nenhum token utilizável. SHA-256 puro basta (sem bcrypt): o segredo
 * tem 256 bits de entropia, não há o que adivinhar por força bruta.
 *
 * Sem `server-only`: usado pelo `proxy.ts`. Só Web Crypto.
 */

export const REFRESH_COOKIE = "bgt_refresh";
/** 7 dias sem usar o painel → login de novo. Cada renovação recomeça a contagem. */
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;
/** Teto ABSOLUTO desde o login: nem renovando todo dia a sessão passa disto. */
export const SESSION_ABSOLUTE_MAX_AGE = 60 * 60 * 24 * 30;
/**
 * Janela em que o token ANTERIOR ainda é tolerado. Duas requisições do
 * mesmo navegador (duas abas, navegação + prefetch) saem com o mesmo
 * refresh; a primeira o troca e a segunda chegaria com um token "já
 * usado". Dentro da janela isso é corrida, não roubo — fora dela, é
 * reuso e a sessão inteira é revogada.
 */
export const REFRESH_GRACE_SECONDS = 30;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const SECRET = /^[A-Za-z0-9_-]{43}$/;

/** 32 bytes aleatórios em base64url (43 caracteres). */
export function newRefreshSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export async function hashRefreshSecret(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const formatRefreshToken = (sid: string, value: string) => `${sid}.${value}`;

/** Cookie → { sid, secret }. Qualquer coisa fora do formato → null, sem ir ao banco. */
export function parseRefreshToken(token: string | undefined): { sid: string; secret: string } | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  const sid = token.slice(0, dot);
  const value = token.slice(dot + 1);
  return dot > 0 && UUID.test(sid) && SECRET.test(value) ? { sid, secret: value } : null;
}
