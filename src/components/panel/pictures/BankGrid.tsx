"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, m } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { panelContent } from "@/config/panel-content";
import { useAction } from "@/lib/action/hooks";
import { deletePanelPicture } from "@/modules/pictures/actions";
import type { BankPicture } from "@/modules/sections/application/sections";
import { duration, ease } from "../motion/tokens";
import { ActionAlert } from "../ui/ActionAlert";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { BOARD_QUERY_KEY } from "./keys";

const t = panelContent.pictures.bank;
const tu = panelContent.pictures.upload;
const names = panelContent.sections.items;

/** O banco de fotos: todas as enviadas, com onde cada uma aparece. */
export function BankGrid({ pictures }: { pictures: BankPicture[] }) {
  const queryClient = useQueryClient();
  const remove = useAction(deletePanelPicture, {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY }),
  });

  return (
    <div className="flex flex-col gap-4">
      <ActionAlert error={remove.error} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {pictures.map((p) => (
          <BankCard
            key={p.id}
            picture={p}
            busy={remove.isPending}
            deleting={remove.isPending && remove.variables?.id === p.id}
            onDelete={() => remove.mutate({ id: p.id })}
          />
        ))}
      </ul>
    </div>
  );
}

function BankCard({
  picture,
  busy,
  deleting,
  onDelete,
}: {
  picture: BankPicture;
  busy: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const landscape = picture.orientation === "landscape";
  const usedNames = picture.usedIn.map((k) => names[k].name);

  return (
    <li
      className={[
        "flex flex-col overflow-hidden rounded-2xl border bg-bg-2 transition-[border-color,opacity] duration-200",
        deleting ? "border-erro/40 opacity-50" : "border-line",
      ].join(" ")}
    >
      <div className="relative aspect-square bg-bg-3">
        <Image
          src={picture.url}
          alt={picture.alt}
          fill
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 240px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-sm text-cream" title={picture.alt}>
          {picture.alt}
        </p>
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <Badge tone={landscape ? "accent" : "neutral"}>{landscape ? tu.landscape : tu.portrait}</Badge>
          {picture.width} × {picture.height}
        </p>
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
          {usedNames.length ? (
            <>
              {t.usedIn}
              {usedNames.map((n) => (
                <Badge key={n} tone="ouro">
                  {n}
                </Badge>
              ))}
            </>
          ) : (
            <span className="italic">{t.unused}</span>
          )}
        </p>

        {/* Exclusão em duas etapas no mesmo lugar (design-system → Exclusão).
            Se a foto está no site, o aviso diz de onde ela vai sair. */}
        <div className="mt-auto pt-1">
          <AnimatePresence initial={false} mode="wait">
            {confirming ? (
              <m.div
                key="confirm"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
                exit={{ opacity: 0, transition: { duration: duration.fast } }}
                className="flex flex-col gap-2"
              >
                {usedNames.length > 0 && <p className="text-xs text-erro">{t.deleteWarning(usedNames.join(", "))}</p>}
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={deleting}>
                    {panelContent.common.cancel}
                  </Button>
                  <Button size="sm" variant="danger" loading={deleting} loadingLabel={t.deleting} onClick={onDelete}>
                    {t.confirmDelete}
                  </Button>
                </div>
              </m.div>
            ) : (
              <m.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => setConfirming(true)}>
                  {t.delete}
                </Button>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </li>
  );
}
