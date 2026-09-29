import "server-only";
import { asc, count, eq, sql } from "drizzle-orm";
import { panelContent } from "@/config/panel-content";
import { DomainError, FieldError } from "@/lib/action/result";
import type { Db } from "@/server/db/client";
import type { UserRecord, UserRepository } from "../domain/ports";
import type { PublicUser } from "../domain/user";
import { users } from "./schema";

const v = panelContent.users.validation;

const publicColumns = {
  id: users.id,
  email: users.email,
  username: users.username,
  name: users.name,
  role: users.role,
  lastLoginAt: users.lastLoginAt,
  createdAt: users.createdAt,
};
const recordColumns = {
  ...publicColumns,
  passwordHash: users.passwordHash,
  sessionVersion: users.sessionVersion,
};

/**
 * O Drizzle embrulha o erro do driver em `cause`. 23505 = unique_violation;
 * o nome da constraint diz qual campo repetiu. É a garantia real contra
 * duplicata — checar antes de inserir teria corrida entre duas requisições.
 */
function rethrowUnique(e: unknown): never {
  let err = e as { code?: string; constraint_name?: string; cause?: unknown };
  while (err && !err.code && err.cause) err = err.cause as typeof err;
  if (err?.code === "23505") {
    if (err.constraint_name === "users_email_unique") {
      throw new FieldError({ email: [v.emailTaken] });
    }
    if (err.constraint_name === "users_username_unique") {
      throw new FieldError({ username: [v.usernameTaken] });
    }
  }
  throw e;
}

export function drizzleUserRepository(db: Db): UserRepository {
  return {
    async findById(id) {
      const [row] = await db.select(recordColumns).from(users).where(eq(users.id, id)).limit(1);
      return row ?? null;
    },

    async findByLogin(identifier) {
      const column = identifier.includes("@") ? users.email : users.username;
      const [row] = await db
        .select(recordColumns)
        .from(users)
        .where(eq(column, identifier))
        .limit(1);
      return row ?? null;
    },

    list() {
      return db.select(publicColumns).from(users).orderBy(asc(users.createdAt));
    },

    async create(data): Promise<PublicUser> {
      try {
        const [row] = await db.insert(users).values(data).returning(publicColumns);
        return row;
      } catch (e) {
        rethrowUnique(e);
      }
    },

    async update(id, { bumpSession, ...patch }): Promise<UserRecord> {
      try {
        const [row] = await db
          .update(users)
          .set({
            ...patch,
            ...(bumpSession ? { sessionVersion: sql`${users.sessionVersion} + 1` } : {}),
          })
          .where(eq(users.id, id))
          .returning(recordColumns);
        if (!row) throw new DomainError(v.notFound);
        return row;
      } catch (e) {
        rethrowUnique(e);
      }
    },

    async delete(id) {
      await db.delete(users).where(eq(users.id, id));
    },

    async countAdmins() {
      const [row] = await db.select({ n: count() }).from(users).where(eq(users.role, "admin"));
      return row.n;
    },

    async touchLastLogin(id) {
      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, id));
    },
  };
}
