"use client";

import Link from "next/link";
import { Images } from "lucide-react";
import { panelContent } from "@/config/panel-content";
import { useActionQuery } from "@/lib/action/hooks";
import { getSectionsBoard } from "@/modules/sections/actions";
import type { Board } from "@/modules/sections/application/sections";
import { SECTION_KEYS } from "@/modules/sections/domain/section";
import { PAGE_LAYOUT, type TextSectionKey } from "@/modules/sections/domain/texts";
import { PanelDndProvider } from "../dnd/PanelDndProvider";
import { BOARD_QUERY_KEY } from "../pictures/keys";
import { ActionAlert } from "../ui/ActionAlert";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Alert } from "../ui/Alert";
import { SectionPanel } from "./SectionPanel";
import { SectionTextEditor } from "./SectionTextEditor";

const t = panelContent.sections;
const c = panelContent.common;

function TextEditor({ board, sectionKey }: { board: Board; sectionKey: TextSectionKey }) {
  return (
    <SectionTextEditor
      sectionKey={sectionKey}
      value={board.texts.texts[sectionKey]}
      customized={board.texts.customized.includes(sectionKey)}
    />
  );
}

/** Seção sem foto para atrelar (ou com o banco vazio): só o nome e os textos. */
function TextOnlyPanel({ board, sectionKey }: { board: Board; sectionKey: TextSectionKey }) {
  // Nome: o das seções só de texto ou, com o banco vazio, o da seção de fotos
  const item =
    sectionKey in t.texts.items
      ? t.texts.items[sectionKey as keyof typeof t.texts.items]
      : t.items[sectionKey as keyof typeof t.items];
  return (
    <section className="rounded-2xl border border-line bg-bg-2 p-5 sm:p-7" aria-labelledby={`section-text-${sectionKey}`}>
      <header className="mb-5">
        <h2 id={`section-text-${sectionKey}`} className="font-display text-xl text-cream">
          {item.name}
        </h2>
        <p className="mt-1 text-sm text-muted">{item.where}</p>
      </header>
      <TextEditor board={board} sectionKey={sectionKey} />
    </section>
  );
}

/** /sections: a página inteira, na ordem — fotos de cada seção e os textos editáveis. */
export function SectionsBoard() {
  const query = useActionQuery(BOARD_QUERY_KEY, getSectionsBoard, undefined);

  if (query.isPending) {
    return (
      <div aria-busy aria-label={c.loading} className="flex flex-col gap-6">
        {SECTION_KEYS.map((k) => (
          <div key={k} className="h-64 animate-pulse rounded-2xl bg-bg-2" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex flex-col items-start gap-4">
        <ActionAlert error={query.error} />
        <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
          {c.retry}
        </Button>
      </div>
    );
  }

  const board = query.data;

  // Banco vazio: não há foto para atrelar, mas texto não depende disso
  if (board.bank.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState
          icon={Images}
          title={t.emptyBankTitle}
          text={t.emptyBankText}
          action={
            <Link
              href="/pictures"
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 font-semibold text-ink transition-colors duration-200 hover:bg-accent-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2"
            >
              {t.goToPictures}
            </Link>
          }
        />
        <Alert tone="info" message={t.texts.onlyTextsNote} />
        {PAGE_LAYOUT.map(({ texts }) => texts && <TextOnlyPanel key={texts} board={board} sectionKey={texts} />)}
      </div>
    );
  }

  return (
    // Um provider para as três listas — o HTML5Backend não aceita dois
    <PanelDndProvider>
      <div className="flex flex-col gap-6">
        {PAGE_LAYOUT.map(({ pictures, texts }) =>
          pictures ? (
            <SectionPanel
              key={pictures}
              sectionKey={pictures}
              pictures={board.sections[pictures]}
              bank={board.bank}
              video={board.videos[pictures]}
            >
              {texts && <TextEditor board={board} sectionKey={texts} />}
            </SectionPanel>
          ) : (
            texts && <TextOnlyPanel key={texts} board={board} sectionKey={texts} />
          ),
        )}
      </div>
    </PanelDndProvider>
  );
}
