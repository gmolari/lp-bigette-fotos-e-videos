import type { UserRecord } from "../domain/ports";
import type { PublicUser } from "../domain/user";

/**
 * Lista explícita do que sai do servidor. Explícita de propósito: coluna
 * nova na tabela NÃO vaza para o cliente até alguém adicioná-la aqui.
 */
export function toPublic(u: UserRecord): PublicUser {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    name: u.name,
    role: u.role,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  };
}
