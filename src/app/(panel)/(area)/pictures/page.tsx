import type { Metadata } from "next";
import { PicturesManager } from "@/components/panel/pictures/PicturesManager";
import { panelContent } from "@/config/panel-content";

const t = panelContent.pictures;

export const metadata: Metadata = { title: t.metaTitle };

export default function PicturesPage() {
  return (
    <>
      <h1 className="font-display text-3xl text-cream">{t.title}</h1>
      <p className="mt-2 mb-8 text-muted">{t.lead}</p>
      <PicturesManager />
    </>
  );
}
