import { panelContent } from "@/config/panel-content";
import { FieldError } from "@/lib/action/result";
import type { UserRepository } from "../domain/ports";
import { toPublic } from "./to-public";

type Hasher = {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
};

export type ProfileDeps = { users: UserRepository; hasher: Hasher };

export async function updateProfile(
  deps: ProfileDeps,
  userId: string,
  data: { name: string | null; email: string; username: string },
) {
  return toPublic(await deps.users.update(userId, data));
}

/**
 * Troca a própria senha. Exige a atual — sessão roubada não basta para
 * tomar a conta. Derruba todas as OUTRAS sessões (bumpSession); quem
 * chama reemite o cookie desta com a versão nova.
 */
export async function changePassword(
  deps: ProfileDeps,
  userId: string,
  data: { currentPassword: string; newPassword: string },
) {
  const user = await deps.users.findById(userId);
  if (!user || !(await deps.hasher.verify(data.currentPassword, user.passwordHash))) {
    throw new FieldError({
      currentPassword: [panelContent.users.validation.currentPasswordWrong],
    });
  }
  return deps.users.update(userId, {
    passwordHash: await deps.hasher.hash(data.newPassword),
    bumpSession: true,
  });
}
