import { panelContent } from "@/config/panel-content";
import { DomainError } from "@/lib/action/result";
import type { UserRepository } from "../domain/ports";
import type { Role } from "../domain/user";
import { toPublic } from "./to-public";

const v = panelContent.users.validation;

export type AdminDeps = {
  users: UserRepository;
  hasher: { hash(plain: string): Promise<string> };
};

export async function createUser(
  deps: AdminDeps,
  data: { email: string; username: string; name: string | null; role: Role; password: string },
) {
  const { password, ...rest } = data;
  return deps.users.create({ ...rest, passwordHash: await deps.hasher.hash(password) });
}

/**
 * Admin edita qualquer um. Regras:
 * - nunca deixar o sistema sem admin (rebaixar o último)
 * - senha trocada derruba as sessões do usuário editado
 *
 * ⚠️ Contar e depois atualizar não é atômico: dois admins rebaixando um
 * ao outro no mesmo instante poderiam zerar os admins. Para um painel de
 * poucas pessoas, aceitável; se crescer, trava com SELECT ... FOR UPDATE.
 */
export async function updateUser(
  deps: AdminDeps,
  data: {
    id: string;
    email: string;
    username: string;
    name: string | null;
    role: Role;
    password?: string;
  },
) {
  const target = await deps.users.findById(data.id);
  if (!target) throw new DomainError(v.notFound);

  if (target.role === "admin" && data.role !== "admin" && (await deps.users.countAdmins()) <= 1) {
    throw new DomainError(v.lastAdmin);
  }

  const { id, password, ...fields } = data;
  return deps.users.update(id, {
    ...fields,
    ...(password ? { passwordHash: await deps.hasher.hash(password), bumpSession: true } : {}),
  });
}

export async function deleteUser(deps: AdminDeps, actorId: string, id: string) {
  if (actorId === id) throw new DomainError(v.cannotDeleteSelf);

  const target = await deps.users.findById(id);
  if (!target) throw new DomainError(v.notFound);
  if (target.role === "admin" && (await deps.users.countAdmins()) <= 1) {
    throw new DomainError(v.lastAdmin);
  }
  await deps.users.delete(id);
}

export async function getUser(deps: Pick<AdminDeps, "users">, id: string) {
  const user = await deps.users.findById(id);
  if (!user) throw new DomainError(v.notFound);
  return toPublic(user);
}
