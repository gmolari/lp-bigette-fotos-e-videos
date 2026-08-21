import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { site } from "@/config/site";
import { allSchemas } from "@/lib/jsonld";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
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
  // `opsz` fica: o navegador aplica sozinho por tamanho de fonte
  // (`font-optical-sizing: auto` é o padrão), então tirá-lo MUDA o
  // desenho dos títulos grandes.
  //
  // `SOFT` e `WONK` saíram. Eles eram a justificativa escrita para
  // escolher a Fraunces, mas nunca foram VARIADOS: não existe um
  // `font-variation-settings` em lugar nenhum do projeto. Ficavam só
  // engordando o arquivo com dados de eixo que ninguém movia. O
  // desenho torto continua — é o padrão da fonte, não dos eixos.
  axes: ["opsz"],
  variable: "--font-display-face",
  display: "swap",
});

/**
 * A Fraunces itálica é um SEGUNDO carregamento, sem pré-carga.
 *
 * Ela só aparece nos 11 gatilhos e nos depoimentos — o primeiro deles
 * está a umas duas telas de distância. Pré-carregar 66 KB que ninguém
 * vê ainda é competir com o H1 do hero, que é justamente o elemento de
 * LCP da página.
 *
 * Medido na cascata (Pixel 7 · 4G · CPU 4×): as fontes são a MAIOR
 * transferência do primeiro carregamento, maiores que todo o
 * JavaScript somado, e terminavam por último.
 *
 * `display: swap` continua: quem chegar num gatilho antes da fonte
 * ficar pronta lê em Georgia por um instante. É um preço pequeno, e só
 * na primeira visita.
 */
const displayItalico = Fraunces({
  subsets: ["latin"],
  style: ["italic"],
  axes: ["opsz"],
  variable: "--font-display-italico-face",
  display: "swap",
  preload: false,
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
    <html lang="pt-BR" className={`${display.variable} ${displayItalico.variable} ${corpo.variable}`}>
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
        <VercelAnalytics />
        {/* Speed Insights: Core Web Vitals de visitante real.
            Fica FORA do <Analytics /> de propósito, que é o bloco de
            terceiros ligado por ID no .env — este não tem ID e não é
            desligável por lá.

            Não contradiz a decisão D9 (nada de banner de cookie):
            o Speed Insights não grava cookie nem identifica visitante,
            então não pede consentimento. Só coleta em deploy na Vercel
            — fora dela o componente não envia nada.

            E é o único instrumento que faz sentido no volume desta
            página: com 30–100 visitas/mês não há o que medir em
            conversão (ver docs/02-analise-economica.md), mas LCP e CLS
            são medidos por visita, não por amostra estatística. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
