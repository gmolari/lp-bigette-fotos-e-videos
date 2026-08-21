import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { site } from "@/config/site";
import { allSchemas } from "@/lib/jsonld";
import { Analytics } from "@/components/analytics/Analytics";
import "./globals.css";

/**
 * Fraunces no display, Instrument Sans no corpo.
 *
 * Fraunces é uma serifa variável com eixos `SOFT` e `WONK` — as
 * terminações saem levemente tortas de propósito. É desenho com mão,
 * não neutralidade, e é o oposto do eixo Playfair/Bodoni, que é a
 * didone que aparece em toda página gerada e não diz nada sobre uma
 * fotógrafa iniciante em Londrina.
 *
 * Instrument Sans no corpo: grotesca contemporânea, um pouco mais
 * estreita e menos anônima que Inter, que aguenta texto corrido.
 *
 * Ambas são servidas pelo next/font — self-hosted, zero requisição ao
 * Google em runtime, zero deslocamento de layout.
 */
const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-display-face",
  display: "swap",
});

const corpo = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-corpo",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0A0911",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: site.titleTemplate,
  },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  authors: [{ name: site.founder, url: site.url }],
  creator: site.founder,
  publisher: site.name,
  category: "photography",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    ...(site.verification.google ? { google: site.verification.google } : {}),
    ...(site.verification.bing
      ? { other: { "msvalidate.01": site.verification.bing } }
      : {}),
  },
  formatDetection: { telephone: true, address: true, email: true },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${corpo.variable}`}>
      <head>
        {/* Dados estruturados — LocalBusiness, FAQ, Person, WebSite */}
        <script
          type="application/ld+json"
          // O conteúdo é gerado por nós, não vem de input do usuário.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(allSchemas()) }}
        />
        {/* Pré-conexão com o WhatsApp — o destino de todos os CTAs */}
        <link rel="preconnect" href="https://wa.me" />
        <link rel="dns-prefetch" href="https://wa.me" />
        {/* Sem JavaScript, nada pode ficar escondido esperando um
            IntersectionObserver que nunca vai rodar. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[999] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-ink"
        >
          Pular para o conteúdo
        </a>
        {children}
        {/* Grão de filme por cima da página inteira: tira o chapado do
            fundo escuro e dá textura fotográfica. */}
        <div aria-hidden="true" className="grao-filme" />
        <Analytics />
      </body>
    </html>
  );
}
