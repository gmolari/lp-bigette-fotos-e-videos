import type { PublicUser, Role } from "./user";

/** Registro completo — só circula no servidor. */
export type UserRecord = PublicUser & {
  passwordHash: string;
  sessionVersion: number;
};

export type UserPatch = Partial<{
  email: string;
  username: string;
  name: string | null;
  role: Role;
  passwordHash: string;
}> & {
  /** Incrementa session_version → derruba todas as sessões desse usuário. */
  bumpSession?: boolean;
};

export type NewUser = {
  email: string;
  username: string;
  name: string | null;
  role: Role;
  passwordHash: string;
};

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
  /** Login: e-mail se tiver "@", senão username. */
  findByLogin(identifier: string): Promise<UserRecord | null>;
  list(): Promise<PublicUser[]>;
  create(data: NewUser): Promise<PublicUser>;
  /** Devolve o registro atualizado (com a sessionVersion nova, se mudou). */
  update(id: string, patch: UserPatch): Promise<UserRecord>;
  delete(id: string): Promise<void>;
  countAdmins(): Promise<number>;
  touchLastLogin(id: string): Promise<void>;
}
