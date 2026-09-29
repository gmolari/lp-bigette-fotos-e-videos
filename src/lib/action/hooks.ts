"use client";

import { unstable_isUnrecognizedActionError } from "next/navigation";
import {
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { panelContent } from "@/config/panel-content";
import type { ActionFailure, ErrorCode, FieldErrors, Result } from "./result";

/**
 * Ponte React Query ↔ server actions.
 *
 * A action devolve `Result` (nunca lança). O React Query precisa de um
 * erro LANÇADO para entrar no estado `error` — então aqui o
 * `{ ok: false }` vira `ActionError`, com código e erros por campo.
 *
 * E quando a action nem responde (sem internet, deploy novo), a promessa
 * rejeita com um erro cru do navegador/Next, em inglês. Isso também vira
 * `ActionError`, com código `NETWORK` ou `STALE` e mensagem em português.
 */

const t = panelContent.errors;

export class ActionError extends Error {
  readonly code: ErrorCode;
  readonly fields?: FieldErrors;
  readonly errorId?: string;
  readonly detail?: string;

  constructor(r: Omit<ActionFailure, "ok">) {
    super(r.error);
    this.name = "ActionError";
    this.code = r.code;
    this.fields = r.fields;
    this.errorId = r.errorId;
    this.detail = r.detail;
  }

  /** A chamada falhou antes de existir resposta. */
  static fromTransport(e: unknown): ActionError {
    if (unstable_isUnrecognizedActionError(e)) {
      return new ActionError({ code: "STALE", error: t.stale });
    }
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    // fetch rejeita com TypeError quando a rede cai ("Failed to fetch",
    // "NetworkError…", "Load failed" — cada navegador escreve de um jeito)
    if (offline || e instanceof TypeError) {
      return new ActionError({ code: "NETWORK", error: t.network, detail: String(e) });
    }
    return new ActionError({
      code: "INTERNAL",
      error: t.internal,
      detail: process.env.NODE_ENV !== "production" ? String(e) : undefined,
    });
  }
}

/** Códigos que valem tentar de novo sozinho: passageiros por natureza. */
export const RETRYABLE: ReadonlySet<ErrorCode> = new Set(["NETWORK", "UNAVAILABLE", "TIMEOUT", "UPSTREAM"]);

export type Action<I, T> = (input: I) => Promise<Result<T>>;

export async function unwrap<T>(call: () => Promise<Result<T>>): Promise<T> {
  let r: Result<T>;
  try {
    r = await call();
  } catch (e) {
    throw ActionError.fromTransport(e);
  }
  if (!r.ok) throw new ActionError(r);
  return r.data;
}

/** Escrita: formulário, botão, qualquer mutação. */
export function useAction<I, T>(
  action: Action<I, T>,
  options?: Omit<UseMutationOptions<T, ActionError, I>, "mutationFn">,
) {
  return useMutation<T, ActionError, I>({
    mutationFn: (input) => unwrap(() => action(input)),
    ...options,
  });
}

/**
 * Leitura via server action.
 *
 * ⚠️ O Next despacha server actions UMA DE CADA VEZ por cliente. Duas
 * consultas na mesma tela rodam em fila, não em paralelo. Se uma tela
 * precisar de várias leituras, junte numa action só.
 */
export function useActionQuery<I, T>(
  key: QueryKey,
  action: Action<I, T>,
  input: I,
  options?: Omit<UseQueryOptions<T, ActionError>, "queryKey" | "queryFn">,
) {
  return useQuery<T, ActionError>({
    queryKey: [...key, input],
    queryFn: () => unwrap(() => action(input)),
    ...options,
  });
}
