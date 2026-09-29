"use client";

import { useState, type FormEvent } from "react";
import type { UseMutationOptions } from "@tanstack/react-query";
import { z } from "zod";
import { useAction, type ActionError } from "@/lib/action/hooks";
import type { FieldErrors, Result } from "@/lib/action/result";

type Options<I, T> = Omit<UseMutationOptions<T, ActionError, I>, "mutationFn"> & {
  /** Valores de partida (edição). null/undefined viram "". */
  initialValues?: Record<string, string | null | undefined>;
  /** Volta aos valores iniciais depois do sucesso (ex.: troca de senha). */
  resetOnSuccess?: boolean;
  /** Depois do sucesso, reescreve os campos com o que o servidor devolveu (já normalizado). */
  syncFromResult?: (data: T) => Record<string, string | null | undefined>;
};

const toStrings = (v: Options<unknown, unknown>["initialValues"] = {}) =>
  Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x ?? ""]));

/**
 * Formulário = esquema zod + server action + React Query.
 *
 * O MESMO esquema valida nos dois lados: no cliente para responder na
 * hora, sem ida ao servidor; na action porque o cliente não é confiável.
 * Erro de campo pode vir de qualquer um dos dois (inclusive "e-mail já
 * em uso", que só o banco sabe) e aparece no mesmo lugar.
 */
export function useActionForm<S extends z.ZodObject, T>(
  schema: S,
  action: (input: z.input<S>) => Promise<Result<T>>,
  { initialValues, resetOnSuccess, syncFromResult, onSuccess, ...options }: Options<z.input<S>, T> = {},
) {
  type Name = keyof z.input<S> & string;

  const [values, setValues] = useState<Record<string, string>>(() => toStrings(initialValues));
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const mutation = useAction(action, {
    ...options,
    onSuccess: (...args) => {
      if (resetOnSuccess) setValues(toStrings(initialValues));
      else if (syncFromResult) setValues((v) => ({ ...v, ...toStrings(syncFromResult(args[0])) }));
      return onSuccess?.(...args);
    },
  });

  const serverErrors = mutation.error?.code === "VALIDATION" ? (mutation.error.fields ?? {}) : {};

  function errorOf(name: Name): string | undefined {
    return clientErrors[name]?.[0] ?? serverErrors[name]?.[0];
  }

  function setValue(name: Name, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    // Quem está corrigindo não precisa continuar vendo o erro
    if (clientErrors[name]) {
      setClientErrors((errs) => {
        const next = { ...errs };
        delete next[name];
        return next;
      });
    }
    // Mexeu depois de enviar: o resultado anterior (erro ou sucesso) caducou
    if (mutation.isError || mutation.isSuccess) mutation.reset();
  }

  /** Props para espalhar num <Field>, <PasswordField> ou <Select>. */
  function field(name: Name) {
    return {
      name,
      value: values[name] ?? "",
      error: errorOf(name),
      onChange: (e: { target: { value: string } }) => setValue(name, e.target.value),
    };
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (mutation.isPending) return;

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setClientErrors(z.flattenError(parsed.error).fieldErrors as FieldErrors);
      return;
    }
    setClientErrors({});
    // Manda o bruto: o servidor revalida e transforma por conta própria
    mutation.mutate(values as z.input<S>);
  }

  return {
    field,
    values,
    setValue,
    submit,
    mutation,
    /** Para o <ActionAlert> do topo do formulário (erros de campo ele mesmo esconde). */
    error: mutation.error,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
}
