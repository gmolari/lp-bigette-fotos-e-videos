"use client";

import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { panelContent } from "@/config/panel-content";
import { useAction } from "@/lib/action/hooks";
import type { Picture } from "@/modules/pictures/domain/picture";
import {
  assignSectionPictures,
  reorderSectionPictures,
  unassignSectionPicture,
} from "@/modules/sections/actions";
import type { Board, BankPicture } from "@/modules/sections/application/sections";
import type { SectionVideo } from "@/modules/sections/domain/video";
import {
  REPEAT_FROM,
  SECTION_RULES,
  sectionStatus,
  type SectionKey,
  type SectionStatus,
} from "@/modules/sections/domain/section";
import { duration, ease } from "../motion/tokens";
import { BOARD_QUERY_KEY } from "../pictures/keys";
import { SortablePictureGrid } from "../pictures/SortablePictureGrid";
import { ActionAlert } from "../ui/ActionAlert";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { PicturePicker } from "./PicturePicker";
import { VideoLinkForm } from "./VideoLinkForm";

const t = panelContent.sections;

/** Estado → frase do painel. A aritmética mora em `sectionStatus` (domain). */
function describe(key: SectionKey, count: number, status: SectionStatus): { tone: "success" | "info"; text: string } {
  const { slots } = SECTION_RULES[key];
  switch (status.kind) {
    case "empty":
      return { tone: "info", text: SECTION_RULES[key].fallback ? t.status.empty : t.status.emptyReserved };
    case "complete":
      return { tone: "success", text: slots === 1 ? t.status.heroComplete : t.status.complete };
    case "overflow":
      if (slots === 1) return { tone: "info", text: t.status.heroOverflow(status.extra) };
      if (key === "portfolio") return { tone: "info", text: t.status.portfolioOverflow(status.extra, slots) };
      return { tone: "info", text: t.status.closingOverflow(status.extra, slots) };
    case "filled-with-defaults":
      return { tone: "info", text: t.status.filledWithDefaults(count, status.defaults, status.toOwn) };
    case "repeating":
      return { tone: "info", text: t.status.repeating(count, slots, status.toIdeal) };
  }
}

export function SectionPanel({
  sectionKey,
  pictures,
  bank,
  video,
}: {
  sectionKey: SectionKey;
  pictures: Picture[];
  bank: BankPicture[];
  /** Só na seção "video". */
  video?: SectionVideo;
}) {
  const queryClient = useQueryClient();
  const [picking, setPicking] = useState(false);
  const item = t.items[sectionKey];
  const rule = SECTION_RULES[sectionKey];
  const { ideal } = rule;

  // Toda action da seção devolve o quadro inteiro: vai direto para o cache,
  // sem uma segunda ida ao servidor para reler.
  const onBoard = (board: Board) => queryClient.setQueryData([...BOARD_QUERY_KEY, undefined], board);
  const assign = useAction(assignSectionPictures, { onSuccess: (b) => (onBoard(b), setPicking(false)) });
  const unassign = useAction(unassignSectionPicture, { onSuccess: onBoard });
  const reorder = useAction(reorderSectionPictures, { onSuccess: onBoard });
  const busy = assign.isPending || unassign.isPending || reorder.isPending;

  const count = pictures.length;
  const status = describe(sectionKey, count, sectionStatus(sectionKey, count));
  // A grade de 2 colunas do celular só fecha com número PAR de fotos em pé
  // (docs/09). Abaixo de REPEAT_FROM a seção é completada com provisórias,
  // então a conta não é só das dela — o aviso só vale a partir daí.
  const portraits = pictures.filter((p) => p.orientation === "portrait").length;
  const oddPortraits = sectionKey === "portfolio" && count >= REPEAT_FROM && portraits % 2 === 1;

  // Orientação que o quadro pede. Na capa do vídeo, é a do próprio vídeo.
  const preferred =
    sectionKey === "video" && video ? (video.format === "vertical" ? "portrait" : "landscape") : rule.preferred;
  // Só as que aparecem: numa seção de 1 lugar, a 2ª em diante é reserva
  const shown = pictures.slice(0, rule.slots);
  const wrongOrientation = preferred ? shown.filter((p) => p.orientation !== preferred).length : 0;
  const tooNarrow = rule.minWidth ? shown.filter((p) => p.width < rule.minWidth!).length : 0;

  return (
    <section className="rounded-2xl border border-line bg-bg-2 p-5 sm:p-7" aria-labelledby={`section-${sectionKey}`}>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 id={`section-${sectionKey}`} className="font-display text-xl text-cream">
            {item.name}
          </h2>
          <p className="mt-1 text-sm text-muted">{item.where}</p>
          <p className="mt-2 text-sm text-cream/85">{item.advice}</p>
          <p className="mt-1 text-sm text-cream/85">
            <span className="font-semibold text-ouro">{t.ratioLabel}:</span> {item.ratio}
          </p>
        </div>
        <Badge tone={count === ideal ? "accent" : "neutral"}>{t.status.counts(count, ideal)}</Badge>
      </header>

      <div className="flex flex-col gap-4">
        <Alert tone={status.tone} message={status.text} />
        {oddPortraits && <Alert tone="info" message={t.status.oddPortraits} />}
        {preferred && wrongOrientation > 0 && (
          <Alert tone="info" message={t.status.wrongOrientation(wrongOrientation, preferred)} />
        )}
        {tooNarrow > 0 && <Alert tone="info" message={t.status.tooNarrow(tooNarrow, rule.minWidth!)} />}
        {sectionKey === "video" && <VideoLinkForm video={video} />}
        <ActionAlert error={assign.error ?? unassign.error ?? reorder.error} />

        {count > 0 ? (
          <SortablePictureGrid
            pictures={pictures}
            itemType={`picture:${sectionKey}`}
            busy={busy}
            removingId={unassign.isPending ? unassign.variables?.pictureId : null}
            onCommit={(pictureIds) => reorder.mutateAsync({ section: sectionKey, pictureIds })}
            onRemove={(pictureId) => unassign.mutate({ section: sectionKey, pictureId })}
          />
        ) : (
          <p className="rounded-2xl border border-dashed border-line-forte px-5 py-8 text-center text-sm text-muted">
            {t.list.emptyTitle}
          </p>
        )}

        <AnimatePresence initial={false} mode="wait">
          {picking ? (
            <m.div
              key="picker"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
              exit={{ opacity: 0, transition: { duration: duration.fast } }}
            >
              <PicturePicker
                sectionName={item.name}
                bank={bank}
                alreadyIn={new Set(pictures.map((p) => p.id))}
                submitting={assign.isPending}
                onCancel={() => setPicking(false)}
                onSubmit={(pictureIds) => assign.mutate({ section: sectionKey, pictureIds })}
              />
            </m.div>
          ) : (
            <m.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button
                variant="secondary"
                size="sm"
                disabled={busy}
                icon={<Plus aria-hidden className="size-4" />}
                onClick={() => setPicking(true)}
              >
                {t.picker.open}
              </Button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
