import type { Metadata } from "next";
import { SectionsBoard } from "@/components/panel/sections/SectionsBoard";
import { panelContent } from "@/config/panel-content";

const t = panelContent.sections;

export const metadata: Metadata = { title: t.metaTitle };

export default function SectionsPage() {
  return (
    <>
      <h1 className="font-display text-3xl text-cream">{t.title}</h1>
      <p className="mt-2 mb-8 text-muted">{t.lead}</p>
      <SectionsBoard />
    </>
  );
}
