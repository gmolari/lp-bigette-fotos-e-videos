import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { AccessError } from "@/lib/action/result";
import { toPublic } from "@/modules/users/application/to-public";
import type { PublicUser } from "@/modules/users/domain/user";
import { drizzleUserRepository } from "@/modules/users/infrastructure/repository";
import { clearSessionCookies, writeAccessCookie, writeRefreshCookie } from "@/server/auth/cookies";
import { SESSION_COOKIE, signSession, verifySession } from "@/server/auth/jwt";
import { parseRefreshToken, REFRESH_COOKIE } from "@/server/auth/refresh-token";
import { getDb } from "@/server/db/client";
import { gateCookieMatches, GATE_COOKIE, getGateKey } from "@/server/panel/gate";
import { closeSession, openSession } from "./application/sessions";
import { drizzleSessionRepository } from "./infrastructure/session-repository";

const sessionDeps = () => ({ sessions: drizzleSessionRepository(getDb()) });

/**
 * Quem está logado — conferido NO BANCO, não só no JWT:
 *   - usuário apagado → null
 *   - session_version mudou (senha trocada) → null
 *   - sessão revogada (logout, reuso de refresh) ou vencida → null.
 *     É o que faz o logout valer NA HORA, e não em até 15 minutos
 *   - papel é o do banco agora, não o do momento do login
 *
 * `cache` do React: layout, página e action da mesma requisição fazem
 * UMA consulta, não três.
 */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const db = getDb();
  const [user, active] = await Promise.all([
    drizzleUserRepository(db).findById(session.sub),
    drizzleSessionRepository(db).isActive(session.sid, session.sub),
  ]);
  if (!user || !active || user.sessionVersion !== session.ver) return null;
  return toPublic(user);
});

/**
 * A sessão deste navegador, por qualquer um dos dois cookies. O refresh
 * vale mesmo com o access vencido — é o caso de quem clica em "Sair"
 * depois de 15 minutos parado.
 */
async function currentSessionId(): Promise<string | null> {
  const jar = await cookies();
  const fromRefresh = parseRefreshToken(jar.get(REFRESH_COOKIE)?.value)?.sid;
  return fromRefresh ?? (await verifySession(jar.get(SESSION_COOKIE)?.value))?.sid ?? null;
}

/**
 * Login (e reemissão após troca de senha): sessão NOVA no banco, par de
 * cookies novo. A sessão que este navegador tinha antes é encerrada —
 * um navegador, uma sessão.
 */
export async function startSession(user: { id: string; sessionVersion: number }) {
  const deps = sessionDeps();
  const previous = await currentSessionId();
  if (previous) await closeSession(deps, previous, "replaced");

  const issued = await openSession(deps, user);
  const jar = await cookies();
  writeAccessCookie(jar, await signSession({ sub: issued.userId, ver: issued.sessionVersion, sid: issued.sid }));
  writeRefreshCookie(jar, issued.refreshToken, issued.refreshExpiresAt);
}

/** Logout: revoga NO BANCO antes de apagar os cookies — cópia do token não sobrevive. */
export async function endSession() {
  const sid = await currentSessionId();
  if (sid) await closeSession(sessionDeps(), sid, "logout");
  clearSessionCookies(await cookies());
}

/**
 * Portão dentro de server action. Obrigatório: a action é um endpoint
 * POST — o `proxy.ts` não a protege sozinho.
 */
export async function requireGate(): Promise<void> {
  const key = getGateKey();
  const value = (await cookies()).get(GATE_COOKIE)?.value;
  if (!key || !(await gateCookieMatches(value, key))) throw new AccessError();
}

export async function requireUser(): Promise<PublicUser> {
  await requireGate();
  const user = await getCurrentUser();
  if (!user) throw new AccessError();
  return user;
}

export async function requireAdmin(): Promise<PublicUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new AccessError("forbidden");
  return user;
}
