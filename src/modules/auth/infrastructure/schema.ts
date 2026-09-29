import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Sem `server-only`: o drizzle-kit e o script `user:create` leem este
 * arquivo fora do Next.
 *
 * Nomes em camelCase aqui; o `casing: "snake_case"` do cliente e do
 * drizzle.config os grava como snake_case no banco.
 */
/**
 * `.enableRLS()` sem nenhuma política = NINGUÉM lê pela API REST do
 * Supabase (roles `anon`/`authenticated`). Sem isso, a chave `anon` —
 * que é pública por natureza — leria os hashes de senha. A aplicação
 * conecta como `postgres`, que ignora RLS, então nada muda para nós.
 * Toda tabela nova em `public` precisa disso.
 */
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  /** Sempre minúsculo e sem espaço — normalizado pelo esquema zod antes de chegar aqui. */
  email: text().notNull().unique(),
  /** Hash bcrypt. Nunca sai do servidor. */
  passwordHash: text().notNull(),
  name: text(),
  lastLoginAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}).enableRLS();

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
