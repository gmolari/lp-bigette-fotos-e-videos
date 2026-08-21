/**
 * ─────────────────────────────────────────────────────────────
 *  FONTE ÚNICA DE VERDADE DO SITE
 *  Edite só este arquivo para trocar textos, contatos e SEO.
 *  Tudo que estiver marcado com  // ⚠️ PREENCHER  é placeholder.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * A cidade é declarada aqui em cima porque ela alimenta o <title>, a meta
 * description e as keywords logo abaixo. Antes esses três campos tinham a
 * cidade escrita à mão, então trocar `city` deixava o title mentindo.
 */
const CIDADE = "Londrina";
const ESTADO = "PR";
const ESTADO_EXTENSO = "Paraná";
const REGIAO = "Londrina e região";

export const site = {
  // ---------- IDENTIDADE ----------
  name: "Bigette Fotos e Vídeos",
  shortName: "Bigette",
  legalName: "Bigette Fotos e Vídeos", // ⚠️ PREENCHER razão social / MEI
  founder: "Bigette",

  // ---------- LOCALIZAÇÃO (crítico para SEO local) ----------
  city: CIDADE,
  state: ESTADO,
  stateFull: ESTADO_EXTENSO,
  region: REGIAO,
  country: "BR",
  // Vazio de propósito: ela não atende em endereço fixo. Campo vazio é
  // omitido do JSON-LD — melhor que publicar um CEP inventado.
  postalCode: "",
  streetAddress: "",
  geo: { lat: -23.3045, lng: -51.1696 }, // centro de Londrina/PR
  serviceRadiusKm: 50, // ⚠️ CONFERIR com ela — 50 km cobre a região metropolitana
  areasAtendidas: [
    "Londrina",
    "Cambé",
    "Ibiporã",
    "Rolândia",
    "Arapongas",
    "Jataizinho",
  ],

  // ---------- CONTATO ----------
  whatsapp: {
    // Só números, com DDI+DDD.
    // ⚠️ PREENCHER — o número real da Bigette foi retirado antes de este
    // repositório ir a público. Sem ele, os 11 CTAs abrem uma conversa
    // com um número inválido: preencha antes de qualquer deploy.
    number: "5500000000000",
    defaultMessage:
      "Oi Bigette! Vim pelo site e quero saber sobre um ensaio.",
  },
  email: "contato@bigette.com.br", // ⚠️ PREENCHER
  instagram: "seu_instagram", // ⚠️ PREENCHER — handle real retirado do repo público
  horarioAtendimento: "Seg a Sáb, 9h às 20h", // ⚠️ PREENCHER
  prazoEntregaDias: 10,            // ⚠️ PREENCHER

  // ---------- SEO ----------
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://bigette.com.br", // ⚠️ PREENCHER via .env.local
  locale: "pt_BR",
  title: `Bigette Fotos e Vídeos — Ensaios e Vídeos em ${CIDADE}`,
  titleTemplate: "%s | Bigette Fotos e Vídeos",
  description: `Ensaios fotográficos e vídeos em ${CIDADE} e região. Direção do início ao fim, para quem acha que não sabe posar. Agende sua data pelo WhatsApp.`,
  keywords: [
    `fotógrafa ${CIDADE}`,
    `ensaio fotográfico ${CIDADE}`,
    `fotógrafo ${CIDADE} ${ESTADO}`,
    "ensaio feminino",
    "ensaio gestante",
    "book fotográfico",
    "fotógrafa de eventos",
    "vídeo para redes sociais",
    "ensaio externo",
    "fotógrafa perto de mim",
  ],

  // ---------- ANALYTICS (opcional, via .env.local) ----------
  analytics: {
    ga4: process.env.NEXT_PUBLIC_GA_ID ?? "",
    metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
    gtm: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  },

  // ---------- VERIFICAÇÃO DE PROPRIEDADE ----------
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? "",
  },
} as const;

export type Site = typeof site;
