import "server-only";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { panelContent } from "@/config/panel-content";
import {
  AccessError,
  DomainError,
  FieldError,
  type ActionFailure,
  type Result,
} from "@/lib/action/result";
// Exceção consciente à direção das camadas: os guards precisam do
// repositório de usuários, e toda action precisa dos guards.
import { requireAdmin, requireGate, requireUser } from "@/modules/auth/guards";
import type { PublicUser } from "@/modules/users/domain/user";
import { classifyError, describeCause } from "./errors";
import { logError, newErrorId } from "./log";

type Guard = "admin" | "user" | "gate" | "public";

type Options<S extends z.ZodType> = {
  /** Nome para o log (ex.: "users.update"). Aparece junto do errorId. */
  name: string;
  /** Esquema zod da entrada. Validado SEMPRE no servidor, mesmo que o cliente já tenha validado. */
  input: S;
  /**
   * Quem pode chamar. Padrão: "user".
   *   admin → portão + sessão + papel admin (conferido no banco)
   *   user  → portão + sessão válida (quase tudo)
   *   gate  → só o portão (o próprio login)
   *   public → qualquer um (nada no painel deveria usar)
   */
  guard?: Guard;
};

/** `user` é garantido (não nulo) quando guard é "user" ou "admin". */
type Context = { user: PublicUser | null };

const t = panelContent.errors;
const isDev = process.env.NODE_ENV !== "production";

/**
 * Fábrica de server actions. Toda ida ao back passa por aqui:
 *
 *   1. confere o acesso (portão / sessão / papel)
 *   2. valida a entrada com zod
 *   3. executa
 *   4. converte QUALQUER desfecho num `Result` com código — nunca lança
 *
 * Uso, num arquivo com "use server":
 *
 *   export const createPicture = createAction(
 *     { name: "pictures.create", input: pictureSchema },
 *     async (data, { user }) => repository.insert(data, user!.id),
 *   );
 */
export function createAction<S extends z.ZodType, T>(
  options: Options<S>,
  run: (data: z.output<S>, ctx: Context) => Promise<T>,
) {
  const guard = options.guard ?? "user";

  return async function action(input: z.input<S>): Promise<Result<T>> {
    try {
      let user: PublicUser | null = null;
      if (guard === "admin") user = await requireAdmin();
      else if (guard === "user") user = await requireUser();
      else if (guard === "gate") await requireGate();

      const parsed = options.input.safeParse(input);
      if (!parsed.success) {
        return {
          ok: false,
          code: "VALIDATION",
          error: t.validation,
          fields: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
        };
      }

      return { ok: true, data: await run(parsed.data, { user }) };
    } catch (e) {
      // redirect() e notFound() são exceções de controle — deixa passar
      unstable_rethrow(e);
      return toFailure(options.name, e);
    }
  };
}

/** Exceção → falha. Esperadas viram código direto; o resto é classificado e logado. */
function toFailure(action: string, e: unknown): ActionFailure {
  if (e instanceof FieldError) {
    return { ok: false, code: "VALIDATION", error: t.validation, fields: e.fields };
  }
  if (e instanceof DomainError) {
    return { ok: false, code: "DOMAIN", error: e.message };
  }
  if (e instanceof AccessError) {
    return e.kind === "forbidden"
      ? { ok: false, code: "FORBIDDEN", error: t.forbidden }
      : { ok: false, code: "UNAUTHENTICATED", error: t.unauthenticated };
  }

  const { code, message, log } = classifyError(e);
  const errorId = newErrorId();
  if (log) logError({ errorId, action, code, error: e });

  return {
    ok: false,
    code,
    error: message,
    errorId,
    ...(isDev ? { detail: describeCause(e) } : {}),
  };
}
