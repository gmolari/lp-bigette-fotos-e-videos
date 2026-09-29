import type { Metadata } from "next";
import { Providers } from "@/components/panel/Providers";
import { panelContent } from "@/config/panel-content";

/**
 * Painel escondido. Três camadas contra indexação, porque qualquer uma
 * sozinha falha em algum caso:
 *   - proxy.ts: sem o link especial, as rotas respondem 404
 *   - X-Robots-Tag no header (proxy.ts)
 *   - meta robots aqui
 * E nenhuma rota do painel aparece no sitemap nem no robots.txt —
 * listar em `Disallow` seria anunciar onde ele está.
 */
export const metadata: Metadata = {
  title: {
    template: panelContent.meta.titleTemplate,
    default: panelContent.meta.title,
  },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  // Sobrescreve o canonical "/" e o Open Graph herdados da landing page
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-svh bg-bg text-cream">{children}</div>
    </Providers>
  );
}
