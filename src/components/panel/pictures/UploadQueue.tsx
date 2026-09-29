"use client";

import { useEffect, useId, useRef, useState, type DragEvent, type FormEvent } from "react";
import { AnimatePresence, m } from "motion/react";
import { ImageUp, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { panelContent } from "@/config/panel-content";
import { useAction, type ActionError } from "@/lib/action/hooks";
import { uploadPanelPicture } from "@/modules/pictures/actions";
import {
  ACCEPTED_MIME,
  ALT_MAX,
  MIN_LONG_SIDE_PX,
  altField,
  orientationOf,
  pictureFileField,
} from "@/modules/pictures/domain/picture";
import { duration, ease } from "../motion/tokens";
import { ActionAlert } from "../ui/ActionAlert";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { BOARD_QUERY_KEY } from "./keys";

const t = panelContent.pictures.upload;
const v = panelContent.pictures.validation;

/**
 * Teto por lote. Não é limite técnico — cada foto vai numa chamada — mas
 * 20 descrições para escrever já é uma sessão inteira de trabalho, e a
 * fila inteira vive na memória da aba (prévias incluídas).
 */
const MAX_BATCH = 20;

type Preview = { url: string; width: number; height: number };

type Item = {
  id: string;
  file: File;
  /** null enquanto mede (ou se não deu para ler). */
  preview: Preview | null;
  alt: string;
  status: "waiting" | "sending" | "failed";
  fileError?: string;
  altError?: string;
  /** Erro da action que não é de campo (rede, limite do Blob…). */
  error?: ActionError;
};

/** Lê largura e altura no navegador, para recusar foto pequena sem subir nada. */
function measure(file: File): Promise<Preview | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    // O navegador já aplica a rotação do EXIF aqui, igual ao sharp no servidor
    img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/** Mesma foto escolhida duas vezes (ou arrastada de novo) não entra repetida. */
const fileKey = (f: File) => `${f.name}:${f.size}:${f.lastModified}`;
const formatMb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
const firstIssue = (r: { success: boolean; error?: { issues: { message: string }[] } }) =>
  r.success ? undefined : r.error?.issues[0]?.message;

/**
 * Envio em LOTE, uma foto por chamada.
 *
 * Não dá para mandar tudo junto: a Vercel corta o corpo da função em
 * 4,5 MB e uma foto sozinha pode ter 4. E o Next já despacha server
 * actions uma de cada vez por cliente — mandar em paralelo não
 * aceleraria nada. Então a fila é sequencial, com progresso, e cada foto
 * tem o próprio resultado: as que falham ficam na fila com o erro, as
 * que vão saem dela. Reenviar não repete as que já foram.
 */
export function UploadQueue() {
  const queryClient = useQueryClient();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "info" | "error"; message: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const mutation = useAction(uploadPanelPicture);

  // Espelho da fila para o que roda fora do render: medições que terminam
  // depois e a limpeza das prévias ao sair da tela.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(
    () => () => itemsRef.current.forEach((i) => i.preview && URL.revokeObjectURL(i.preview.url)),
    [],
  );

  const patch = (id: string, change: Partial<Item>) =>
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...change } : i)));

  function remove(id: string) {
    setItems((list) => {
      const gone = list.find((i) => i.id === id);
      if (gone?.preview) URL.revokeObjectURL(gone.preview.url);
      return list.filter((i) => i.id !== id);
    });
  }

  function add(files: FileList | File[] | null) {
    if (!files || sending) return;
    setNotice(null);

    const known = new Set(items.map((i) => fileKey(i.file)));
    const fresh: File[] = [];
    let duplicates = 0;
    for (const f of Array.from(files)) {
      const k = fileKey(f);
      if (known.has(k)) duplicates++;
      else {
        known.add(k);
        fresh.push(f);
      }
    }

    const room = MAX_BATCH - items.length;
    const taken = fresh.slice(0, Math.max(room, 0));
    if (fresh.length > taken.length) setNotice({ tone: "info", message: t.tooMany(MAX_BATCH) });
    else if (duplicates) setNotice({ tone: "info", message: t.duplicate });

    const created: Item[] = taken.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: null,
      alt: "",
      status: "waiting",
      // Tamanho e formato: mesma regra do servidor, respondida na hora
      fileError: firstIssue(pictureFileField.safeParse(file)),
    }));
    setItems((list) => [...list, ...created]);
    if (inputRef.current) inputRef.current.value = "";

    for (const item of created) {
      if (item.fileError) continue;
      void measure(item.file).then((preview) => {
        // Tirada da fila enquanto media: só libera a memória
        if (!itemsRef.current.some((i) => i.id === item.id)) {
          if (preview) URL.revokeObjectURL(preview.url);
          return;
        }
        if (!preview) return patch(item.id, { fileError: v.fileUnreadable });
        patch(item.id, {
          preview,
          fileError: Math.max(preview.width, preview.height) < MIN_LONG_SIDE_PX ? v.fileTooSmall : undefined,
        });
      });
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    add(e.dataTransfer.files);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending || items.length === 0) return;

    // Confere TODAS antes de mandar a primeira: descobrir no meio do lote
    // que a 7ª está sem descrição deixaria o lote pela metade.
    const checked = items.map((i) => ({ ...i, altError: firstIssue(altField.safeParse(i.alt)) }));
    setItems(checked);
    if (checked.some((i) => i.fileError || i.altError || !i.preview)) {
      setNotice({ tone: "error", message: t.fixBefore });
      return;
    }

    setNotice(null);
    setSending(true);
    let ok = 0;
    let failed = 0;

    for (const [n, item] of checked.entries()) {
      setProgress({ current: n + 1, total: checked.length });
      patch(item.id, { status: "sending", error: undefined });
      try {
        await mutation.mutateAsync({ file: item.file, alt: item.alt });
        ok++;
        remove(item.id);
      } catch (err) {
        failed++;
        const error = err as ActionError;
        patch(item.id, {
          status: "failed",
          error,
          fileError: error.fields?.file?.[0],
          altError: error.fields?.alt?.[0],
        });
        // Sessão caiu ou o painel mudou: as próximas falhariam igual
        if (error.code === "UNAUTHENTICATED" || error.code === "STALE") break;
      }
    }

    setSending(false);
    setProgress(null);
    // Uma atualização da lista no fim, não uma por foto: cada consulta é
    // uma action e entraria na fila entre um envio e o próximo.
    if (ok) await queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY });
    if (ok && !failed) setNotice({ tone: "success", message: t.done(ok) });
    else if (ok && failed) setNotice({ tone: "info", message: t.partial(ok, failed) });
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Alert tone={notice?.tone} message={notice?.message} />

      {/* Área de soltar: arrastar do explorador de arquivos ou clicar.
          O <input multiple> é o controle de verdade (teclado e leitor de
          tela); a área só amplia o alvo. */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!sending) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "flex flex-col items-center gap-3 rounded-2xl border border-dashed px-5 py-7 text-center",
          "transition-[border-color,background-color] duration-200",
          dragOver ? "border-accent bg-accent/10" : "border-line-forte",
        ].join(" ")}
      >
        <span className="grid size-12 place-items-center rounded-full bg-bg-3 text-accent">
          <ImageUp aria-hidden className="size-5" />
        </span>
        <p className="text-sm text-muted">
          {t.drop} <span className="text-muted/70">{t.or}</span>
        </p>
        <label
          htmlFor={inputId}
          aria-disabled={sending || items.length >= MAX_BATCH || undefined}
          className="inline-flex h-9 cursor-pointer items-center rounded-full border border-line-forte px-3.5 text-sm font-semibold text-cream transition-colors duration-200 hover:border-accent hover:text-accent-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-2 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          {items.length ? t.addMore : t.choose}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            multiple
            accept={ACCEPTED_MIME.join(",")}
            disabled={sending || items.length >= MAX_BATCH}
            className="sr-only"
            aria-describedby={`${inputId}-hint`}
            onChange={(e) => add(e.target.files)}
          />
        </label>
        <p id={`${inputId}-hint`} className="text-xs text-muted">
          {t.lead}
        </p>
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <QueueRow
                key={item.id}
                item={item}
                locked={sending}
                onAlt={(alt) =>
                  patch(item.id, {
                    alt,
                    altError: undefined,
                    ...(item.status === "failed" ? { status: "waiting", error: undefined } : {}),
                  })
                }
                onRemove={() => remove(item.id)}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {items.length > 0 && (
        <div>
          <Button
            type="submit"
            loading={sending}
            loadingLabel={progress ? t.progress(progress.current, progress.total) : undefined}
          >
            {t.submit(items.length)}
          </Button>
        </div>
      )}
    </form>
  );
}

function QueueRow({
  item,
  locked,
  onAlt,
  onRemove,
}: {
  item: Item;
  locked: boolean;
  onAlt: (alt: string) => void;
  onRemove: () => void;
}) {
  const { file, preview, status } = item;

  return (
    <m.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
      exit={{ opacity: 0, transition: { duration: duration.fast } }}
      aria-busy={status === "sending" || undefined}
      className={[
        "flex flex-col gap-4 rounded-2xl border bg-bg-2 p-4 sm:flex-row",
        status === "failed" || item.fileError ? "border-erro/40" : status === "sending" ? "border-accent" : "border-line",
      ].join(" ")}
    >
      <div className="relative grid size-24 shrink-0 place-items-center self-center overflow-hidden rounded-xl bg-bg-3 sm:self-start">
        {preview ? (
          // Prévia local (blob:), não passa pelo otimizador
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.url} alt="" className="size-full object-cover" />
        ) : (
          <ImageUp aria-hidden className="size-6 text-accent" />
        )}
        {status === "sending" && <span className="absolute inset-0 animate-pulse bg-accent/25" />}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-cream" title={file.name}>
              {file.name}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              {preview && (
                <>
                  {preview.width} × {preview.height} px ·{" "}
                  <Badge tone="neutral">
                    {orientationOf(preview.width, preview.height) === "landscape" ? t.landscape : t.portrait}
                  </Badge>
                </>
              )}
              {formatMb(file.size)}
              {status !== "waiting" && (
                <Badge tone={status === "sending" ? "accent" : "ouro"}>
                  {status === "sending" ? t.sending : t.failed}
                </Badge>
              )}
            </p>
          </div>
          <button
            type="button"
            aria-label={`${t.remove}: ${file.name}`}
            disabled={locked}
            onClick={onRemove}
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-bg-3 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        {item.fileError && <p className="text-sm text-erro">{item.fileError}</p>}

        {!item.fileError && (
          <Field
            label={t.alt}
            name={`alt-${item.id}`}
            hint={t.altHint}
            value={item.alt}
            maxLength={ALT_MAX}
            disabled={locked}
            error={item.altError}
            onChange={(e) => onAlt(e.target.value)}
          />
        )}

        <ActionAlert error={item.error} />
      </div>
    </m.li>
  );
}
