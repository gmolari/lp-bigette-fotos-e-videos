"use client";

import Link from "next/link";
import { Images } from "lucide-react";
import { panelContent } from "@/config/panel-content";
import { useActionQuery } from "@/lib/action/hooks";
import { getSectionsBoard } from "@/modules/sections/actions";
import { SECTION_KEYS } from "@/modules/sections/domain/section";
import { PanelDndProvider } from "../dnd/PanelDndProvider";
import { BOARD_QUERY_KEY } from "../pictures/keys";
import { ActionAlert } from "../ui/ActionAlert";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { SectionPanel } from "./SectionPanel";

const t = panelContent.sections;
const c = panelContent.common;

/** /sections: atrelar fotos do banco a cada seção e ordenar. */
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

  if (query.data.bank.length === 0) {
    return (
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
    );
  }

  return (
    // Um provider para as três listas — o HTML5Backend não aceita dois
    <PanelDndProvider>
      <div className="flex flex-col gap-6">
        {SECTION_KEYS.map((key) => (
          <SectionPanel
            key={key}
            sectionKey={key}
            pictures={query.data.sections[key]}
            bank={query.data.bank}
            video={query.data.videos[key]}
          />
        ))}
      </div>
    </PanelDndProvider>
  );
}
