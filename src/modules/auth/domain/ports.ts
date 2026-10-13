/** Por que uma sessão foi encerrada. Fica gravado na linha. */
export type RevokeReason =
  | "logout" // a pessoa saiu
  | "replaced" // login novo (ou troca de senha) no mesmo navegador
  | "reuse" // refresh token já usado apareceu de novo: possível roubo
  | "stale"; // senha trocada depois do login (session_version mudou)

export type SessionRecord = {
  id: string;
  userId: string;
  sessionVersion: number;
  tokenHash: string;
  previousTokenHash: string | null;
  rotatedAt: Date | null;
  expiresAt: Date;
  revokedAt: Date | null;
};

export type NewSession = {
  id: string;
  userId: string;
  sessionVersion: number;
  tokenHash: string;
  expiresAt: Date;
  absoluteExpiresAt: Date;
};

export interface SessionRepository {
  create(session: NewSession): Promise<void>;
  /**
   * A troca do refresh token, ATÔMICA: um UPDATE só, condicionado ao hash
   * apresentado ser o que está em vigor, à sessão estar viva e à versão
   * de sessão do usuário não ter mudado. De duas requisições com o mesmo
   * token, exatamente uma recebe a linha; a outra recebe `null`.
   */
  rotate(input: {
    id: string;
    presentedHash: string;
    newHash: string;
    now: Date;
    /** Novo vencimento pedido; o banco o limita ao teto absoluto da sessão. */
    expiresAt: Date;
  }): Promise<{ userId: string; sessionVersion: number; expiresAt: Date } | null>;
  find(id: string): Promise<SessionRecord | null>;
  /** A sessão existe, é deste usuário, não foi revogada nem venceu? */
  isActive(id: string, userId: string): Promise<boolean>;
  /** Não mexe em sessão já revogada (o primeiro motivo é o que vale). */
  revoke(id: string, reason: RevokeReason): Promise<void>;
  /** Apaga as sessões do usuário vencidas, ou revogadas, há mais de 7 dias. */
  purge(userId: string, now: Date): Promise<void>;
}
