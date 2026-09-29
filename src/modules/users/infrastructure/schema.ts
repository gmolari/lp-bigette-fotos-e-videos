import { sql } from "drizzle-orm";
import { check, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Sem `server-only`: o drizzle-kit e o script `user:create` leem este
 * arquivo fora do Next.
 *
 * camelCase aqui; o `casing: "snake_case"` grava snake_case no banco.
 */

export const userRole = pgEnum("user_role", ["admin", "member"]);

/**
 * `.enableRLS()` sem nenhuma política = NINGUÉM lê pela API REST do
 * Supabase (roles `anon`/`authenticated`). Sem isso, a chave `anon` —
 * pública por natureza — leria os hashes de senha. A aplicação conecta
 * como `postgres`, que ignora RLS. Toda tabela nova em `public` precisa disso.
 */
export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    /** Único. Sempre minúsculo — o zod normaliza e o CHECK garante. */
    email: text().notNull().unique(),
    /** Único. Login aceita e-mail OU username. Formato garantido pelo CHECK. */
    username: text().notNull().unique(),
    /** Hash bcrypt. Nunca sai do servidor. */
    passwordHash: text().notNull(),
    name: text(),
    role: userRole().notNull().default("member"),
    /**
     * Vai dentro do JWT. Incrementar invalida TODAS as sessões do usuário
     * (troca de senha, troca de papel, exclusão lógica no futuro).
     */
    sessionVersion: integer().notNull().default(1),
    lastLoginAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // Defesa no banco: mesmo um INSERT fora da aplicação não cria
    // "Maria@x.com" ao lado de "maria@x.com".
    check("users_email_lowercase", sql`${t.email} = lower(${t.email})`),
    check("users_username_format", sql`${t.username} ~ '^[a-z][a-z0-9._-]{2,29}$'`),
  ],
).enableRLS();

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
