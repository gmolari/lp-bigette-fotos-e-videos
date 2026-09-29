"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, GripVertical, X } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";
import { panelContent } from "@/config/panel-content";
import type { Picture } from "@/modules/pictures/domain/picture";
import { Badge } from "../ui/Badge";

const t = panelContent.sections.list;
const tu = panelContent.pictures.upload;

type DragItem = { id: string };

function move<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const sameOrder = (a: Picture[], b: Picture[]) => a.length === b.length && a.every((p, i) => p.id === b[i].id);

/**
 * Grade de fotos ordenável por arrastar (react-dnd). Precisa de um
 * `PanelDndProvider` acima.
 *
 * Durante o arrasto a lista é um RASCUNHO local — reordena a cada
 * passagem por cima de outra foto, sem ida ao servidor. Só ao soltar a
 * ordem vai para `onCommit`. Deu certo ou não, o rascunho some quando a
 * promessa termina: ou os dados novos chegam por `pictures`, ou volta a
 * ordem salva.
 *
 * `itemType` separa as listas da mesma tela: foto do banner não pode ser
 * solta no meio do varal.
 */
export function SortablePictureGrid({
  pictures,
  itemType,
  busy,
  removingId,
  onCommit,
  onRemove,
}: {
  pictures: Picture[];
  itemType: string;
  busy: boolean;
  removingId?: string | null;
  onCommit: (ids: string[]) => Promise<unknown>;
  onRemove: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Picture[] | null>(null);
  // O `end` do arrasto é uma closure criada no início e veria o estado antigo
  const draftRef = useRef<Picture[] | null>(null);
  const items = draft ?? pictures;

  function clear() {
    draftRef.current = null;
    setDraft(null);
  }

  function moveTo(id: string, to: number) {
    const current = draftRef.current ?? pictures;
    const from = current.findIndex((p) => p.id === id);
    if (from === -1 || from === to || to < 0 || to >= current.length) return;
    const next = move(current, from, to);
    draftRef.current = next;
    setDraft(next);
  }

  function persist() {
    const current = draftRef.current;
    if (!current || sameOrder(current, pictures)) return clear();
    void onCommit(current.map((p) => p.id))
      .catch(() => {})
      .finally(clear);
  }

  /** Teclado e toque sem arrastar: move uma casa e salva na hora. */
  function nudge(id: string, delta: number) {
    const from = items.findIndex((p) => p.id === id);
    moveTo(id, from + delta);
    persist();
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((p, i) => (
        <Card
          key={p.id}
          picture={p}
          index={i}
          total={items.length}
          itemType={itemType}
          busy={busy}
          removing={removingId === p.id}
          onHover={moveTo}
          onDrop={persist}
          onNudge={nudge}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

const iconButton =
  "grid size-8 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-bg-3 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2 disabled:cursor-not-allowed disabled:opacity-40";

function Card({
  picture,
  index,
  total,
  itemType,
  busy,
  removing,
  onHover,
  onDrop,
  onNudge,
  onRemove,
}: {
  picture: Picture;
  index: number;
  total: number;
  itemType: string;
  busy: boolean;
  removing: boolean;
  onHover: (id: string, to: number) => void;
  onDrop: () => void;
  onNudge: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}) {
  const [{ isDragging }, drag, preview] = useDrag<DragItem, unknown, { isDragging: boolean }>(
    () => ({
      type: itemType,
      item: { id: picture.id },
      canDrag: () => !busy,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      // Soltar fora de qualquer alvo também salva: o rascunho já andou
      end: () => onDrop(),
    }),
    [picture.id, itemType, busy, onDrop],
  );

  const [, drop] = useDrop<DragItem>(
    () => ({
      accept: itemType,
      hover: (item) => {
        if (item.id !== picture.id) onHover(item.id, index);
      },
    }),
    [picture.id, itemType, index, onHover],
  );

  const landscape = picture.orientation === "landscape";

  return (
    <li
      // Com o React 19, o conector do react-dnd não serve direto como ref
      ref={(node) => {
        preview(drop(node));
      }}
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-bg-2",
        "transition-[border-color,opacity] duration-200",
        isDragging || removing ? "border-accent opacity-40" : "border-line hover:border-line-forte",
      ].join(" ")}
    >
      <div className="relative aspect-square bg-bg-3">
        <Image
          src={picture.url}
          alt={picture.alt}
          fill
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 240px"
          className="object-cover"
          draggable={false}
        />
        <span className="absolute top-2 left-2 grid size-7 place-items-center rounded-full bg-bg/80 text-xs font-semibold text-cream backdrop-blur">
          <span className="sr-only">{t.position} </span>
          {index + 1}
        </span>
        <button
          type="button"
          ref={(node) => {
            drag(node);
          }}
          aria-label={t.dragHandle}
          disabled={busy}
          className="absolute top-2 right-2 grid size-8 cursor-grab touch-none place-items-center rounded-full bg-bg/80 text-cream backdrop-blur transition-colors duration-200 hover:text-accent-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GripVertical aria-hidden className="size-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-sm text-cream" title={picture.alt}>
          {picture.alt}
        </p>
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <Badge tone={landscape ? "accent" : "neutral"}>{landscape ? tu.landscape : tu.portrait}</Badge>
        </p>

        <div className="mt-auto flex items-center gap-1 pt-1">
          <button
            type="button"
            aria-label={t.moveUp}
            disabled={busy || index === 0}
            onClick={() => onNudge(picture.id, -1)}
            className={iconButton}
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            aria-label={t.moveDown}
            disabled={busy || index === total - 1}
            onClick={() => onNudge(picture.id, 1)}
            className={iconButton}
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
          {/* Tirar da seção não apaga nada: a foto continua no banco.
              Por isso um clique só, sem confirmação. */}
          <button
            type="button"
            aria-label={`${t.remove}: ${picture.alt}`}
            title={t.remove}
            disabled={busy}
            onClick={() => onRemove(picture.id)}
            className={`${iconButton} ml-auto`}
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
