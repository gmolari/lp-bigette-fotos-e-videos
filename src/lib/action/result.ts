/**
 * Contrato de toda server action do projeto. Compartilhado entre
 * servidor e cliente — sem `server-only`, sem dependência de framework.
 *
 * Action NUNCA lança para o cliente: devolve um `Result`. Cada falha tem
 * um `code` que diz O QUE aconteceu e uma mensagem segura para mostrar.
 * Detalhe técnico só vai junto em desenvolvimento; em produção fica no
 * log do servidor, achável pelo `errorId`.
 *
 * Spec: .claude/specs/004-error-handling.md
 */

export type FieldErrors = Partial<Record<string, string[]>>;

export type ErrorCode =
  // ── esperados: culpa da entrada ou da regra, não do sistema ──
  | "VALIDATION" // entrada reprovada (zod ou constraint) → `fields` preenchido
  | "DOMAIN" // regra de negócio recusou; a mensagem é a própria regra
  | "UNAUTHENTICATED" // sem sessão / sessão morta → cliente manda para /login
  | "FORBIDDEN" // logado, mas o papel não permite
  | "CONFLICT" // registro duplicado ou preso a outro (constraint não mapeada)
  | "INVALID_DATA" // banco recusou o formato do dado
  // ── do sistema: logados no servidor com errorId ──
  | "UNAVAILABLE" // banco fora do ar, pooler cheio, rede entre servidor e banco
  | "TIMEOUT" // consulta cancelada por demora
  | "UPSTREAM" // serviço de fora (Vercel Blob) recusou, caiu ou limitou
  | "CONFIG" // variável de ambiente ausente/inválida, credencial do banco errada
  | "SCHEMA" // banco desatualizado: migration pendente
  | "INTERNAL" // bug — qualquer coisa não prevista
  // ── só no cliente: a action nem chegou a responder ──
  | "NETWORK" // sem internet / servidor inalcançável
  | "STALE"; // deploy novo, aba antiga: a action não existe mais

export type ActionFailure = {
  ok: false;
  code: ErrorCode;
  /** Sempre segura para o usuário. */
  error: string;
  fields?: FieldErrors;
  /** Para achar no log do servidor. Só em erros do sistema. */
  errorId?: string;
  /** Causa técnica. SÓ em desenvolvimento. */
  detail?: string;
};

export type Result<T> = { ok: true; data: T } | ActionFailure;

/** Erro de regra de negócio. A mensagem VAI para o usuário. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

/**
 * Erro de negócio ligado a campos específicos (ex.: e-mail já em uso).
 * Vira `VALIDATION` com `fields` — aparece embaixo do campo, como erro do zod.
 */
export class FieldError extends Error {
  constructor(readonly fields: Record<string, string[]>) {
    super("field error");
    this.name = "FieldError";
  }
}

/** Sem sessão (→ login) ou sem permissão (→ fica, com aviso). */
export class AccessError extends Error {
  constructor(readonly kind: "unauthenticated" | "forbidden" = "unauthenticated") {
    super(`access denied: ${kind}`);
    this.name = "AccessError";
  }
}

/**
 * Um serviço externo (Vercel Blob) falhou. Existe para o erro NÃO cair no
 * classificador genérico: os códigos de rede do Node são os mesmos do
 * banco, e a mensagem sairia "não conseguimos falar com o banco".
 * `userMessage` substitui a mensagem padrão quando o motivo é útil
 * (ex.: cota do plano grátis estourada).
 */
export class UpstreamError extends Error {
  constructor(
    readonly service: string,
    message: string,
    readonly userMessage?: string,
    options?: { cause?: unknown },
  ) {
    super(`${service}: ${message}`, options);
    this.name = "UpstreamError";
  }
}

/**
 * Configuração do servidor ausente ou inválida (env, segredo). Não é bug
 * de código nem culpa do usuário: alguém precisa ajustar o ambiente.
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}
