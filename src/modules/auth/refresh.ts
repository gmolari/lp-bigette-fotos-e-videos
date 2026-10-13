import "server-only";
import { signSession } from "@/server/auth/jwt";
import { getDb } from "@/server/db/client";
import { describeCause } from "@/server/errors";
import { rotateSession } from "./application/sessions";
import { drizzleSessionRepository } from "./infrastructure/session-repository";

/**
 * A renovação, do jeito que o `proxy.ts` precisa: recebe o cookie do
 * refresh e devolve os tokens novos já prontos para gravar.
 *
 * Mora no proxy (e não numa action) por um motivo do Next: Server
 * Component não pode gravar cookie. O proxy roda ANTES da página e da
 * action, então quando elas leem a sessão o access token já é o novo.
 */
export type RefreshOutcome =
  /** `refresh` ausente = corrida: outra requisição já gravou o cookie novo. */
  | { kind: "ok"; accessToken: string; refresh?: { token: string; expiresAt: Date } }
  /** Token inválido, vencido, revogado ou reusado: apagar os cookies. */
  | { kind: "rejected" }
  /** Banco fora do ar: NÃO apagar nada — a sessão pode estar boa. */
  | { kind: "error" };

export async function refreshSession(presented: string | undefined): Promise<RefreshOutcome> {
  if (!presented) return { kind: "rejected" };

  try {
    const result = await rotateSession({ sessions: drizzleSessionRepository(getDb()) }, presented);

    if (result.kind === "rejected") {
      // Reuso é o único desfecho que pode ser ataque: fica no log
      if (result.reason === "reuse") {
        console.warn(
          JSON.stringify({ level: "warn", event: "auth.refresh.reuse", note: "refresh token já usado; sessão revogada" }),
        );
      }
      return { kind: "rejected" };
    }

    if (result.kind === "raced") {
      const { sid, userId, sessionVersion } = result;
      return { kind: "ok", accessToken: await signSession({ sub: userId, ver: sessionVersion, sid }) };
    }

    const { sid, userId, sessionVersion, refreshToken, refreshExpiresAt } = result.session;
    return {
      kind: "ok",
      accessToken: await signSession({ sub: userId, ver: sessionVersion, sid }),
      refresh: { token: refreshToken, expiresAt: refreshExpiresAt },
    };
  } catch (e) {
    console.error(`[auth] renovação de sessão falhou — causa: ${describeCause(e)}`);
    return { kind: "error" };
  }
}
