import "server-only";
import { and, eq, gt, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import type { Db } from "@/server/db/client";
import { users } from "../../users/infrastructure/schema";
import type { SessionRepository } from "../domain/ports";
import { authSessions as s } from "./schema";

const DAY = 24 * 60 * 60 * 1000;

export function drizzleSessionRepository(db: Db): SessionRepository {
  return {
    async create(session) {
      await db.insert(s).values(session);
    },

    /**
     * No SET do Postgres, o lado direito enxerga a linha ANTIGA: por isso
     * `previous_token_hash = token_hash` guarda o hash que está saindo.
     * O `FROM users` confere a versão de sessão na mesma instrução.
     */
    async rotate({ id, presentedHash, newHash, now, expiresAt }) {
      const [row] = await db
        .update(s)
        .set({
          previousTokenHash: sql`${s.tokenHash}`,
          tokenHash: newHash,
          rotatedAt: now,
          expiresAt: sql`least(${expiresAt.toISOString()}::timestamptz, ${s.absoluteExpiresAt})`,
        })
        .from(users)
        .where(
          and(
            eq(s.id, id),
            eq(s.tokenHash, presentedHash),
            isNull(s.revokedAt),
            gt(s.expiresAt, now),
            eq(users.id, s.userId),
            eq(users.sessionVersion, s.sessionVersion),
          ),
        )
        .returning({ userId: s.userId, sessionVersion: s.sessionVersion, expiresAt: s.expiresAt });
      return row ?? null;
    },

    async find(id) {
      const [row] = await db
        .select({
          id: s.id,
          userId: s.userId,
          sessionVersion: s.sessionVersion,
          tokenHash: s.tokenHash,
          previousTokenHash: s.previousTokenHash,
          rotatedAt: s.rotatedAt,
          expiresAt: s.expiresAt,
          revokedAt: s.revokedAt,
        })
        .from(s)
        .where(eq(s.id, id))
        .limit(1);
      return row ?? null;
    },

    async isActive(id, userId) {
      const [row] = await db
        .select({ id: s.id })
        .from(s)
        .where(and(eq(s.id, id), eq(s.userId, userId), isNull(s.revokedAt), gt(s.expiresAt, sql`now()`)))
        .limit(1);
      return Boolean(row);
    },

    async revoke(id, reason) {
      await db
        .update(s)
        .set({ revokedAt: new Date(), revokedReason: reason })
        .where(and(eq(s.id, id), isNull(s.revokedAt)));
    },

    async purge(userId, now) {
      const cutoff = new Date(now.getTime() - 7 * DAY);
      await db
        .delete(s)
        .where(and(eq(s.userId, userId), or(lt(s.expiresAt, cutoff), and(isNotNull(s.revokedAt), lt(s.revokedAt, cutoff)))));
    },
  };
}
