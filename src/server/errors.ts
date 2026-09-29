import { panelContent } from "@/config/panel-content";
import { ConfigError, UpstreamError, type ErrorCode } from "@/lib/action/result";

/**
 * Traduz uma exceção qualquer num código + mensagem segura.
 *
 * Sem `server-only`: puro, sem API de Node. Mas só faz sentido no
 * servidor — é onde as exceções de banco existem.
 */

const t = panelContent.errors;

export type Classified = {
  code: ErrorCode;
  message: string;
  /** Vale registrar no log? (erros do sistema sim; negados/esperados não) */
  log: boolean;
};

type ErrLike = { code?: unknown; message?: unknown; cause?: unknown; name?: unknown };

/**
 * O Drizzle embrulha o erro do driver (`DrizzleQueryError: Failed query…`)
 * e o motivo real fica em `cause`. Desce a cadeia até o primeiro erro que
 * tem `code` (SQLSTATE do Postgres ou código de rede do Node).
 */
export function rootCause(e: unknown): ErrLike {
  let cur = e as ErrLike;
  for (let i = 0; i < 10 && cur; i++) {
    if (typeof cur.code === "string") return cur;
    if (!cur.cause || typeof cur.cause !== "object") break;
    cur = cur.cause as ErrLike;
  }
  return (cur ?? {}) as ErrLike;
}

/** Códigos de rede do Node e do postgres.js: não chegamos ao banco. */
const NETWORK_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EPIPE",
  "CONNECT_TIMEOUT",
  "CONNECTION_CLOSED",
  "CONNECTION_ENDED",
  "CONNECTION_DESTROYED",
]);

export function classifyError(e: unknown): Classified {
  if (e instanceof ConfigError) return { code: "CONFIG", message: t.config, log: true };
  // Antes dos códigos de rede: ECONNRESET do armazenamento não é "banco fora do ar"
  if (e instanceof UpstreamError) {
    return { code: "UPSTREAM", message: e.userMessage ?? t.upstream, log: true };
  }

  const code = String(rootCause(e).code ?? "");

  if (NETWORK_CODES.has(code)) return { code: "UNAVAILABLE", message: t.unavailable, log: true };

  // SQLSTATE — https://www.postgresql.org/docs/current/errcodes-appendix.html
  switch (true) {
    case code.startsWith("08"): // connection_exception
    case code === "53300": // too_many_connections (pooler cheio)
    case code === "57P01": // admin_shutdown
    case code === "57P02": // crash_shutdown
    case code === "57P03": // cannot_connect_now (banco subindo)
      return { code: "UNAVAILABLE", message: t.unavailable, log: true };

    case code === "57014": // query_canceled (statement_timeout)
      return { code: "TIMEOUT", message: t.timeout, log: true };

    case code === "28P01": // invalid_password
    case code === "28000": // invalid_authorization_specification
    case code === "3D000": // invalid_catalog_name (banco não existe)
    case code === "42501": // insufficient_privilege
      return { code: "CONFIG", message: t.config, log: true };

    case code === "42P01": // undefined_table
    case code === "42703": // undefined_column
    case code === "42704": // undefined_object (ex.: enum)
    case code === "42883": // undefined_function
      return { code: "SCHEMA", message: t.schema, log: true };

    case code === "23505": // unique_violation não mapeada pelo repositório
      return { code: "CONFLICT", message: t.conflict, log: true };
    case code === "23503": // foreign_key_violation
      return { code: "CONFLICT", message: t.conflictReference, log: true };

    case code === "23502": // not_null_violation
    case code === "23514": // check_violation
    case code.startsWith("22"): // data_exception (formato, tamanho, uuid inválido…)
      return { code: "INVALID_DATA", message: t.invalidData, log: true };
  }

  return { code: "INTERNAL", message: t.internal, log: true };
}

/** Uma linha legível da causa real, para o `detail` em desenvolvimento. */
export function describeCause(e: unknown): string {
  const root = rootCause(e);
  const top = e as ErrLike;
  const name = String(root.name ?? top.name ?? "Error");
  const message = String(root.message ?? top.message ?? e);
  return root.code ? `${name} [${String(root.code)}]: ${message}` : `${name}: ${message}`;
}
