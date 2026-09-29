import type { UserRepository } from "@/modules/users/domain/ports";
import type { Credentials } from "../domain/credentials";

/**
 * Hash bcrypt válido de uma senha que ninguém tem. Quando o usuário não
 * existe, comparamos contra ele mesmo assim: sem isso, "não existe"
 * responde em ~5 ms e "senha errada" em ~200 ms, e o tempo de resposta
 * diria quais e-mails/usernames têm conta.
 */
const DUMMY_HASH = "$2b$12$xaRBhokggkMWU/jsZXTLkeeIRuikqmmw4VYmcLp//wpEhxvJHQKYS";

export type SignInDeps = {
  users: UserRepository;
  verify(plain: string, hash: string): Promise<boolean>;
};

/** Devolve o usuário autenticado, ou null. Nunca diz QUAL dos dois estava errado. */
export async function signIn(deps: SignInDeps, credentials: Credentials) {
  const user = await deps.users.findByLogin(credentials.identifier);
  const valid = await deps.verify(credentials.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return null;

  await deps.users.touchLastLogin(user.id);
  return user;
}
