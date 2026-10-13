import {
  formatRefreshToken,
  hashRefreshSecret,
  newRefreshSecret,
  parseRefreshToken,
  REFRESH_GRACE_SECONDS,
  REFRESH_MAX_AGE,
  SESSION_ABSOLUTE_MAX_AGE,
} from "@/server/auth/refresh-token";
import type { SessionRepository } from "../domain/ports";

/**
 * O ciclo de vida da sessão: abrir (login), renovar (refresh) e fechar
 * (logout). Sem cookie e sem JWT aqui — só a regra. Quem grava cookie é
 * `guards.ts` (actions) e `proxy.ts` (renovação).
 *
 * Spec: .claude/specs/009-refresh-token.md
 */

export type SessionDeps = { sessions: SessionRepository; now?: () => Date };

/** O que vira access token (identidade) + o refresh token novo. */
export type IssuedSession = {
  sid: string;
  userId: string;
  sessionVersion: number;
  /** O valor do cookie. Só existe aqui, nesta resposta: o banco tem o hash. */
  refreshToken: string;
  refreshExpiresAt: Date;
};

export type RotateResult =
  | { kind: "rotated"; session: IssuedSession }
  /** Corrida: outra requisição acabou de trocar este token. Access novo, refresh não. */
  | { kind: "raced"; sid: string; userId: string; sessionVersion: number }
  | { kind: "rejected"; reason: "malformed" | "unknown" | "revoked" | "expired" | "stale" | "reuse" };

const clock = (deps: SessionDeps) => (deps.now ?? (() => new Date()))();
const after = (from: Date, seconds: number) => new Date(from.getTime() + seconds * 1000);

/** Login: sessão nova, com o primeiro refresh token. */
export async function openSession(
  deps: SessionDeps,
  user: { id: string; sessionVersion: number },
): Promise<IssuedSession> {
  const now = clock(deps);
  const sid = crypto.randomUUID();
  const secret = newRefreshSecret();
  const refreshExpiresAt = after(now, REFRESH_MAX_AGE);

  // Limpeza de carona: não há cron, e a tabela só cresce em login
  await deps.sessions.purge(user.id, now);
  await deps.sessions.create({
    id: sid,
    userId: user.id,
    sessionVersion: user.sessionVersion,
    tokenHash: await hashRefreshSecret(secret),
    expiresAt: refreshExpiresAt,
    absoluteExpiresAt: after(now, SESSION_ABSOLUTE_MAX_AGE),
  });

  return {
    sid,
    userId: user.id,
    sessionVersion: user.sessionVersion,
    refreshToken: formatRefreshToken(sid, secret),
    refreshExpiresAt,
  };
}

/**
 * Troca o refresh token apresentado por um novo. O apresentado deixa de
 * valer no mesmo instante — refresh token é de USO ÚNICO.
 *
 * Se a troca não acontece, o motivo importa:
 *
 *   token em vigor, mas a senha mudou   → "stale": revoga
 *   token ANTERIOR, trocado há segundos → "raced": é o mesmo navegador
 *                                         em duas requisições; segue
 *   token anterior fora da janela, ou
 *   qualquer outro para esta sessão     → "reuse": alguém guardou um
 *                                         token já usado. Não dá para
 *                                         saber quem é o dono legítimo,
 *                                         então a sessão INTEIRA morre e
 *                                         os dois lados voltam ao login.
 */
export async function rotateSession(deps: SessionDeps, presented: string | undefined): Promise<RotateResult> {
  const parsed = parseRefreshToken(presented);
  if (!parsed) return { kind: "rejected", reason: "malformed" };

  const now = clock(deps);
  const presentedHash = await hashRefreshSecret(parsed.secret);
  const secret = newRefreshSecret();

  const rotated = await deps.sessions.rotate({
    id: parsed.sid,
    presentedHash,
    newHash: await hashRefreshSecret(secret),
    now,
    expiresAt: after(now, REFRESH_MAX_AGE),
  });
  if (rotated) {
    return {
      kind: "rotated",
      session: {
        sid: parsed.sid,
        userId: rotated.userId,
        sessionVersion: rotated.sessionVersion,
        refreshToken: formatRefreshToken(parsed.sid, secret),
        refreshExpiresAt: rotated.expiresAt,
      },
    };
  }

  const session = await deps.sessions.find(parsed.sid);
  if (!session) return { kind: "rejected", reason: "unknown" };
  if (session.revokedAt) return { kind: "rejected", reason: "revoked" };
  if (session.expiresAt <= now) return { kind: "rejected", reason: "expired" };

  // O token era o certo e a sessão está viva: só resta a versão do usuário
  if (session.tokenHash === presentedHash) {
    await deps.sessions.revoke(session.id, "stale");
    return { kind: "rejected", reason: "stale" };
  }

  const justRotated =
    session.previousTokenHash === presentedHash &&
    session.rotatedAt !== null &&
    now.getTime() - session.rotatedAt.getTime() <= REFRESH_GRACE_SECONDS * 1000;
  if (justRotated) {
    return { kind: "raced", sid: session.id, userId: session.userId, sessionVersion: session.sessionVersion };
  }

  await deps.sessions.revoke(session.id, "reuse");
  return { kind: "rejected", reason: "reuse" };
}

/** Logout (ou sessão trocada por outra): o refresh e o access param de valer agora. */
export async function closeSession(deps: SessionDeps, sid: string, reason: "logout" | "replaced") {
  await deps.sessions.revoke(sid, reason);
}
