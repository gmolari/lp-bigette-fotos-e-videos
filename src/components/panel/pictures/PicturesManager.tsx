"use client";

import Link from "next/link";
import { Images } from "lucide-react";
import { panelContent } from "@/config/panel-content";
import { useActionQuery } from "@/lib/action/hooks";
import { getSectionsBoard } from "@/modules/sections/actions";
import { ActionAlert } from "../ui/ActionAlert";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Panel } from "../ui/Panel";
import { BankGrid } from "./BankGrid";
import { BOARD_QUERY_KEY } from "./keys";
import { UploadQueue } from "./UploadQueue";

const t = panelContent.pictures;
const c = panelContent.common;

/** /pictures: o banco de imagens. Enviar aqui; atrelar às seções em /sections. */
export function PicturesManager() {
  const query = useActionQuery(BOARD_QUERY_KEY, getSectionsBoard, undefined);

  return (
    <div className="flex flex-col gap-6">
      <Panel title={t.upload.title}>
        <UploadQueue />
      </Panel>

      <Panel title={t.bank.title} lead={t.bank.lead}>
        {query.isPending ? (
          <ul aria-busy aria-label={c.loading} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-bg-3" />
            ))}
          </ul>
        ) : query.isError ? (
          <div className="flex flex-col items-start gap-4">
            <ActionAlert error={query.error} />
            <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
              {c.retry}
            </Button>
          </div>
        ) : query.data.bank.length === 0 ? (
          <EmptyState icon={Images} title={t.emptyTitle} text={t.emptyText} />
        ) : (
          <div className="flex flex-col gap-5">
            <BankGrid pictures={query.data.bank} />
            <div>
              <Link
                href="/sections"
                className="inline-flex h-9 items-center rounded-full border border-line-forte px-3.5 text-sm font-semibold text-cream transition-colors duration-200 hover:border-accent hover:text-accent-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2"
              >
                {t.bank.goToSections}
              </Link>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
