"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { panelContent } from "@/config/panel-content";
import type { BankPicture } from "@/modules/sections/application/sections";
import { Button } from "../ui/Button";

const t = panelContent.sections.picker;

/**
 * Escolher fotos do banco para uma seção. Marca várias; entram no FIM da
 * seção na ordem em que foram marcadas (o número no canto mostra essa
 * ordem). As que já estão na seção aparecem, mas travadas.
 */
export function PicturePicker({
  sectionName,
  bank,
  alreadyIn,
  submitting,
  onCancel,
  onSubmit,
}: {
  sectionName: string;
  bank: BankPicture[];
  alreadyIn: Set<string>;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (pictureIds: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const available = bank.filter((p) => !alreadyIn.has(p.id));

  const toggle = (id: string) =>
    setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-accent/40 bg-bg p-4">
      <div>
        <h3 className="font-display text-lg text-cream">{t.title(sectionName)}</h3>
        <p className="mt-1 text-sm text-muted">{available.length ? t.lead : t.allUsed}</p>
      </div>

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {bank.map((p) => {
          const locked = alreadyIn.has(p.id);
          const order = selected.indexOf(p.id);
          const on = order !== -1;
          return (
            <li key={p.id}>
              <button
                type="button"
                disabled={locked || submitting}
                aria-pressed={on}
                aria-label={locked ? `${p.alt} — ${t.alreadyIn}` : p.alt}
                onClick={() => toggle(p.id)}
                className={[
                  "relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-bg-3",
                  "transition-[border-color,opacity] duration-200",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2",
                  locked ? "cursor-not-allowed border-transparent opacity-35" : on ? "border-accent" : "border-transparent hover:border-line-forte",
                ].join(" ")}
              >
                <Image src={p.url} alt="" fill sizes="(max-width:640px) 33vw, 160px" className="object-cover" />
                {on && (
                  <span className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-accent text-xs font-bold text-ink">
                    {order + 1}
                  </span>
                )}
                {locked && (
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-bg/85 py-1 text-[11px] text-cream">
                    <Check aria-hidden className="size-3" />
                    {t.alreadyIn}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={selected.length === 0}
          loading={submitting}
          loadingLabel={t.submitting}
          onClick={() => onSubmit(selected)}
        >
          {t.submit(selected.length)}
        </Button>
        <Button size="sm" variant="ghost" disabled={submitting} onClick={onCancel}>
          {t.close}
        </Button>
      </div>
    </div>
  );
}
