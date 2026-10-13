"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { panelContent } from "@/config/panel-content";
import { useAction } from "@/lib/action/hooks";
import { resetSectionTexts, saveSectionTexts } from "@/modules/sections/actions";
import type { Board } from "@/modules/sections/application/sections";
import {
  textSchemas,
  type SaveTextInput,
  type SectionTexts,
  type TextSectionKey,
} from "@/modules/sections/domain/texts";
import { BOARD_QUERY_KEY } from "../pictures/keys";
import { ActionAlert } from "../ui/ActionAlert";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Textarea } from "../ui/Textarea";
import { TEXT_FORMS, type FieldSpec, type ListFieldSpec } from "./textForms";

const t = panelContent.sections.texts;
const l = panelContent.sections.list;

/** Item de lista no rascunho. O `id` só existe para a chave do React sobreviver à reordenação. */
type Row = { id: number; values: Record<string, string> };
type Draft = Record<string, string | Row[]>;

/** Item que é um texto só (parágrafo) vira `{ value }` no rascunho. */
const SINGLE = "value";

let nextId = 0;
const newRow = (values: Record<string, string>): Row => ({ id: nextId++, values });

function toDraft(specs: FieldSpec[], value: Record<string, unknown>): Draft {
  return Object.fromEntries(
    specs.map((spec) => {
      if (spec.kind === "text") return [spec.name, String(value[spec.name] ?? "")];
      const items = (value[spec.name] ?? []) as (string | Record<string, string>)[];
      return [spec.name, items.map((item) => newRow(typeof item === "string" ? { [SINGLE]: item } : { ...item }))];
    }),
  );
}

function fromDraft(specs: FieldSpec[], draft: Draft): Record<string, unknown> {
  return Object.fromEntries(
    specs.map((spec) => {
      if (spec.kind === "text") return [spec.name, draft[spec.name]];
      const rows = draft[spec.name] as Row[];
      return [spec.name, rows.map((row) => (spec.fields ? row.values : row.values[SINGLE]))];
    }),
  );
}

const iconButton =
  "grid size-8 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-bg-3 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Os textos de UMA seção. Fechado por padrão: /sections já é uma tela
 * longa, e texto se mexe bem menos que foto.
 *
 * O formulário parte do que a página mostra hoje — o padrão de
 * `content.ts` ou o personalizado. Salvar grava a seção inteira; "voltar
 * ao padrão" apaga o personalizado.
 */
export function SectionTextEditor<K extends TextSectionKey>({
  sectionKey,
  value,
  customized,
}: {
  sectionKey: K;
  value: SectionTexts[K];
  customized: boolean;
}) {
  const queryClient = useQueryClient();
  const specs = TEXT_FORMS[sectionKey];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => toDraft(specs, value));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);

  // As actions devolvem o quadro inteiro: vai para o cache, e o rascunho
  // passa a ser o que o servidor gravou (já sem espaços nas pontas).
  const onBoard = (board: Board) => {
    queryClient.setQueryData([...BOARD_QUERY_KEY, undefined], board);
    setDraft(toDraft(specs, board.texts.texts[sectionKey]));
    setConfirming(false);
  };
  const save = useAction(saveSectionTexts, { onSuccess: onBoard });
  const reset = useAction(resetSectionTexts, { onSuccess: onBoard });
  const busy = save.isPending || reset.isPending;

  /** Qualquer edição apaga o erro do campo e o resultado da última gravação. */
  function touch(path: string) {
    if (errors[path]) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => k !== path)));
    if (!save.isIdle) save.reset();
    if (!reset.isIdle) reset.reset();
    setConfirming(false);
  }

  function setText(name: string, text: string) {
    setDraft((d) => ({ ...d, [name]: text }));
    touch(name);
  }

  /** `structural`: incluir, remover ou mover — os índices mudam e os erros da lista caducam. */
  function setRows(name: string, change: (rows: Row[]) => Row[], structural: boolean) {
    setDraft((d) => ({ ...d, [name]: change(d[name] as Row[]) }));
    if (structural) {
      setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !k.startsWith(`${name}.`))));
      touch(name);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;

    const parsed = textSchemas[sectionKey].safeParse(fromDraft(specs, draft));
    if (!parsed.success) {
      const found: Record<string, string> = {};
      for (const issue of parsed.error.issues) found[issue.path.join(".")] ??= issue.message;
      setErrors(found);
      return;
    }
    setErrors({});
    save.mutate({ section: sectionKey, content: parsed.data } as SaveTextInput);
  }

  const headingId = `texts-${sectionKey}`;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-bg p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 id={headingId} className="font-display text-lg text-cream">
          {t.title}
        </h3>
        <Badge tone={customized ? "accent" : "neutral"}>{customized ? t.isCustom : t.isDefault}</Badge>
        <Button
          variant="secondary"
          size="sm"
          className="ml-auto"
          aria-expanded={open}
          aria-controls={`${headingId}-form`}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? t.close : t.open}
        </Button>
      </div>

      {open && (
        <form id={`${headingId}-form`} aria-labelledby={headingId} onSubmit={submit} noValidate className="flex flex-col gap-4">
          {specs.map((spec) =>
            spec.kind === "text" ? (
              <TextInput
                key={spec.name}
                spec={spec}
                name={`${sectionKey}.${spec.name}`}
                value={draft[spec.name] as string}
                error={errors[spec.name]}
                disabled={busy}
                onChange={(text) => setText(spec.name, text)}
              />
            ) : (
              <ListInput
                key={spec.name}
                spec={spec}
                prefix={sectionKey}
                rows={draft[spec.name] as Row[]}
                errors={errors}
                disabled={busy}
                onRows={(change, structural) => setRows(spec.name, change, structural)}
                onTouch={touch}
              />
            ),
          )}

          <ActionAlert error={save.error ?? reset.error} />
          {/* Erro de campo vindo só do servidor não tem onde aparecer: avisa aqui */}
          <Alert message={save.error?.code === "VALIDATION" ? panelContent.errors.validation : undefined} />
          <Alert tone="success" message={save.isSuccess ? t.saved : reset.isSuccess ? t.resetDone : undefined} />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" loading={save.isPending} loadingLabel={t.saving} disabled={reset.isPending}>
              {t.save}
            </Button>
            {customized && (
              <Button
                size="sm"
                variant={confirming ? "danger" : "ghost"}
                loading={reset.isPending}
                loadingLabel={t.resetting}
                disabled={save.isPending}
                onClick={() => (confirming ? reset.mutate({ section: sectionKey }) : setConfirming(true))}
              >
                {confirming ? t.confirmReset : t.reset}
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function TextInput({
  spec,
  name,
  value,
  error,
  disabled,
  onChange,
}: {
  spec: { label: string; hint?: string; multiline?: boolean };
  name: string;
  value: string;
  error: string | undefined;
  disabled: boolean;
  onChange: (text: string) => void;
}) {
  const props = {
    name,
    label: spec.label,
    hint: spec.hint,
    value,
    error,
    disabled,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
  };
  return spec.multiline ? <Textarea {...props} /> : <Field autoComplete="off" {...props} />;
}

function ListInput({
  spec,
  prefix,
  rows,
  errors,
  disabled,
  onRows,
  onTouch,
}: {
  spec: ListFieldSpec;
  prefix: string;
  rows: Row[];
  errors: Record<string, string>;
  disabled: boolean;
  onRows: (change: (rows: Row[]) => Row[], structural: boolean) => void;
  onTouch: (path: string) => void;
}) {
  const resizable = Boolean(spec.add);
  const pinned = Boolean(spec.pinFirst);
  const inputs = spec.fields ?? [{ name: SINGLE, label: "", multiline: true }];

  const move = (index: number, by: -1 | 1) =>
    onRows((list) => {
      const next = [...list];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    }, true);

  const edit = (index: number, field: string, text: string) => {
    onRows(
      (list) => list.map((row, i) => (i === index ? { ...row, values: { ...row.values, [field]: text } } : row)),
      false,
    );
    onTouch(spec.fields ? `${spec.name}.${index}.${field}` : `${spec.name}.${index}`);
  };

  return (
    <div className="flex flex-col gap-3">
      {spec.note && <p className="text-xs text-muted">{spec.note}</p>}
      {spec.pinFirst && <p className="text-xs text-muted">{spec.pinFirst}</p>}

      <ol className="flex flex-col gap-3">
        {rows.map((row, index) => {
          const label = spec.itemLabel(index + 1);
          const locked = pinned && index === 0;
          return (
            <li key={row.id} className="flex flex-col gap-3 rounded-xl border border-line bg-bg-2 p-3.5">
              <div className="flex items-center gap-1">
                {/* Item de um campo só: o rótulo do campo já diz qual é */}
                {spec.fields ? <p className="mr-auto text-sm font-semibold text-ouro">{label}</p> : <span className="mr-auto" />}
                {resizable && (
                  <>
                    <button
                      type="button"
                      aria-label={`${l.moveUp}: ${label}`}
                      disabled={disabled || locked || index === (pinned ? 1 : 0)}
                      onClick={() => move(index, -1)}
                      className={iconButton}
                    >
                      <ChevronUp aria-hidden className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`${l.moveDown}: ${label}`}
                      disabled={disabled || locked || index === rows.length - 1}
                      onClick={() => move(index, 1)}
                      className={iconButton}
                    >
                      <ChevronDown aria-hidden className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`${t.remove}: ${label}`}
                      title={t.remove}
                      disabled={disabled || locked || rows.length <= spec.min}
                      onClick={() => onRows((list) => list.filter((_, i) => i !== index), true)}
                      className={iconButton}
                    >
                      <X aria-hidden className="size-4" />
                    </button>
                  </>
                )}
              </div>

              {inputs.map((input) => (
                <TextInput
                  key={input.name}
                  // Item de um campo só: o rótulo é o do próprio item
                  spec={spec.fields ? input : { ...input, label }}
                  name={`${prefix}.${spec.name}.${index}.${input.name}`}
                  value={row.values[input.name] ?? ""}
                  error={errors[spec.fields ? `${spec.name}.${index}.${input.name}` : `${spec.name}.${index}`]}
                  disabled={disabled}
                  onChange={(text) => edit(index, input.name, text)}
                />
              ))}
            </li>
          );
        })}
      </ol>

      <Alert message={errors[spec.name]} />

      {spec.add && (
        <div>
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled || rows.length >= spec.max}
            icon={<Plus aria-hidden className="size-4" />}
            onClick={() => onRows((list) => [...list, newRow(Object.fromEntries(inputs.map((i) => [i.name, ""])))], true)}
          >
            {spec.add}
          </Button>
        </div>
      )}
    </div>
  );
}
