"use server";

import { z } from "zod";
import { startSession } from "@/modules/auth/guards";
import { createAction } from "@/server/action";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { getDb } from "@/server/db/client";
import { createUser, deleteUser, getUser, updateUser } from "./application/admin";
import { changePassword, updateProfile } from "./application/profile";
import { toPublic } from "./application/to-public";
import {
  changePasswordSchema,
  createUserSchema,
  profileSchema,
  updateUserSchema,
  userIdSchema,
} from "./domain/user";
import { drizzleUserRepository } from "./infrastructure/repository";

const deps = () => ({
  users: drizzleUserRepository(getDb()),
  hasher: { hash: hashPassword, verify: verifyPassword },
});

// ── Próprio usuário ─────────────────────────────────────────────

export const updateMyProfile = createAction({ name: "users.updateMyProfile", input: profileSchema }, async (data, { user }) =>
  updateProfile(deps(), user!.id, data),
);

export const changeMyPassword = createAction(
  { name: "users.changeMyPassword", input: changePasswordSchema },
  async (data, { user }) => {
    const updated = await changePassword(deps(), user!.id, data);
    // As outras sessões morreram com o bump; esta continua, com a versão nova
    await startSession(updated);
    return null;
  },
);

// ── Admin ───────────────────────────────────────────────────────

export const listUsers = createAction({ name: "users.list", input: z.void(), guard: "admin" }, async () =>
  deps().users.list(),
);

export const getUserById = createAction({ name: "users.get", input: userIdSchema, guard: "admin" }, async ({ id }) =>
  getUser(deps(), id),
);

export const adminCreateUser = createAction(
  { name: "users.create", input: createUserSchema, guard: "admin" },
  async (data) => createUser(deps(), data),
);

export const adminUpdateUser = createAction(
  { name: "users.update", input: updateUserSchema, guard: "admin" },
  async (data, { user }) => {
    const updated = await updateUser(deps(), data);
    // Admin trocou a PRÓPRIA senha por aqui: não se desloga
    if (updated.id === user!.id && data.password) await startSession(updated);
    return toPublic(updated);
  },
);

export const adminDeleteUser = createAction(
  { name: "users.delete", input: userIdSchema, guard: "admin" },
  async ({ id }, { user }) => {
    await deleteUser(deps(), user!.id, id);
    return null;
  },
);
