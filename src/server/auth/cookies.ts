import { ACCESS_MAX_AGE, SESSION_COOKIE } from "./jwt";
import { REFRESH_COOKIE } from "./refresh-token";

/**
 * Os dois cookies da sessão, gravados do MESMO jeito pela action (login)
 * e pelo proxy (renovação). Sem `server-only`: o proxy usa.
 *
 *   httpOnly  → JavaScript da página não lê (XSS não rouba o token)
 *   secure    → só por HTTPS em produção
 *   sameSite  → lax: não vai em POST vindo de outro site (CSRF), mas vai
 *               quando alguém abre o painel por um link no WhatsApp.
 *               Com `strict`, esse primeiro acesso chegaria sem sessão.
 */

/** O que `cookies()` do Next e `response.cookies` têm em comum. */
type CookieJar = {
  set(name: string, value: string, options: Record<string, unknown>): unknown;
  delete(name: string): unknown;
};

const base = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
});

export function writeAccessCookie(jar: CookieJar, accessToken: string) {
  jar.set(SESSION_COOKIE, accessToken, { ...base(), maxAge: ACCESS_MAX_AGE });
}

/** O cookie vence junto com o token no banco — nunca depois. */
export function writeRefreshCookie(jar: CookieJar, refreshToken: string, expiresAt: Date) {
  jar.set(REFRESH_COOKIE, refreshToken, { ...base(), expires: expiresAt });
}

export function clearSessionCookies(jar: CookieJar) {
  jar.delete(SESSION_COOKIE);
  jar.delete(REFRESH_COOKIE);
}
