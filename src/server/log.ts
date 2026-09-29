import "server-only";
import { describeCause, rootCause } from "./errors";

/**
 * Log de erro do servidor. Uma linha JSON por erro em produção — é o que
 * os logs da Vercel indexam e deixam buscar por `errorId`. Em
 * desenvolvimento, legível e com a pilha inteira.
 */
export function logError(entry: { errorId: string; action: string; code: string; error: unknown }) {
  const { error, ...meta } = entry;
  const stack = error instanceof Error ? error.stack : undefined;
  const root = rootCause(error);

  if (process.env.NODE_ENV === "production") {
    console.error(
      JSON.stringify({
        level: "error",
        ...meta,
        cause: describeCause(error),
        sqlstate: typeof root.code === "string" ? root.code : undefined,
        stack,
      }),
    );
  } else {
    console.error(
      `\n[server action] ${meta.action} → ${meta.code} (errorId ${meta.errorId})\n` +
        `  causa: ${describeCause(error)}\n` +
        (stack ? `${stack}\n` : ""),
    );
  }
}

/** 8 caracteres bastam para achar no log de um painel deste tamanho. */
export const newErrorId = () => crypto.randomUUID().slice(0, 8);
