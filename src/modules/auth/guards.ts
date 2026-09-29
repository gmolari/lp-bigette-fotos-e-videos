import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { AccessError } from "@/lib/action/result";
import { toPublic } from "@/modules/users/application/to-public";
import type { PublicUser } from "@/modules/users/domain/user";
import { drizzleUserRepository } from "@/modules/users/infrastructure/repository";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "@/server/auth/jwt";
import { getDb } from "@/server/db/client";
import { gateCookieMatches, GATE_COOKIE, getGateKey } from "@/server/panel/gate";

/**
 * Quem está logado — conferido NO BANCO, não só no JWT:
 *   - usuário apagado → null
 *   - session_version mudou (senha trocada) → null
 *   - papel é o do banco agora, não o do momento do login
 *
 * `cache` do React: layout, página e action da mesma requisição fazem
 * UMA consulta, não três.
 */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const user = await drizzleUserRepository(getDb()).findById(session.sub);
  if (!user || user.sessionVersion !== session.ver) return null;
  return toPublic(user);
});

export async function startSession(user: { id: string; sessionVersion: number }) {
  (await cookies()).set(SESSION_COOKIE, await signSession({ sub: user.id, ver: user.sessionVersion }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
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
