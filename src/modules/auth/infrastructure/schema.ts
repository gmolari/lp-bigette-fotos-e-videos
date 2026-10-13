import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "../../users/infrastructure/schema";

/**
 * Sem `server-only`: o drizzle-kit lê este arquivo fora do Next.
 *
 * Uma linha por SESSÃO (um login num aparelho). O refresh token gira
 * dentro da linha: a cada renovação o hash atual vira o anterior e entra
 * um novo. Guardar o anterior é o que permite distinguir corrida de
 * reuso — ver `application/sessions.ts` e a spec 009.
 *
 * Só HASH de token mora aqui. RLS ligado e sem política: a API REST do
 * Supabase não lê nada.
 */
export const authSessions = pgTable(
  "auth_sessions",
  {
    /** Vai no access token (`sid`) e na frente do refresh token. */
    id: uuid().primaryKey(),
    /** Usuário excluído → as sessões dele somem junto. */
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /**
     * users.session_version no login. Mudou lá (senha trocada) → esta
     * sessão não renova mais, sem ninguém precisar revogá-la.
     */
    sessionVersion: integer().notNull(),
    /** SHA-256 do refresh token em vigor. */
    tokenHash: text().notNull(),
    /** SHA-256 do refresh anterior, tolerado por alguns segundos após a troca. */
    previousTokenHash: text(),
    rotatedAt: timestamp({ withTimezone: true }),
    /** Vencimento do refresh em vigor: 7 dias após a última renovação. */
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    /** Teto desde o login. `expires_at` nunca passa disto. */
    absoluteExpiresAt: timestamp({ withTimezone: true }).notNull(),
    revokedAt: timestamp({ withTimezone: true }),
    /** logout · replaced · reuse · stale — para ler no banco o que houve. */
    revokedReason: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("auth_sessions_user_idx").on(t.userId)],
).enableRLS();
