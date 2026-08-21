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

/**
 * Normaliza a URL do site vinda do ambiente.
 *
 * `layout.tsx` passa isto para `metadataBase`, que faz `new URL(...)` —
 * e `new URL()` NÃO aceita domínio sem protocolo. Escrever
 * `bigette.com.br` no painel da Vercel (que é o que se escreve) derruba
 * o build inteiro:
 *
 *     TypeError: Invalid URL  ·  code ERR_INVALID_URL
 *     Failed to collect page data for /_not-found
 *
 * Repare que a mensagem aponta para `/_not-found` e não diz qual
 * variável causou. Uma barra no fim, por outro lado, passava — ou seja,
 * o formulário aceitava um erro e recusava o outro, sem explicar
 * nenhum dos dois.
 *
 * Então a entrada é CONSERTADA em vez de confiada: espaço em volta,
 * barra no fim e protocolo ausente. Se ainda assim não formar uma URL
 * válida, cai no padrão — um deploy com o canonical errado é ruim, um
 * build que não sai é pior, e a variável não é lugar de descobrir um
 * erro de digitação.
 */
function normalizarUrl(bruto: string | undefined, padrao: string): string {
  const limpo = bruto?.trim().replace(/\/+$/, "");
  if (!limpo) return padrao;
  const comProtocolo = /^https?:\/\//i.test(limpo) ? limpo : `https://${limpo}`;
  try {
    const u = new URL(comProtocolo);
    return `${u.origin}${u.pathname}`.replace(/\/+$/, "");
  } catch {
    return padrao;
  }
}

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
  // ⚠️ PREENCHER via .env.local (ou nas variáveis do provedor).
  // `VERCEL_PROJECT_PRODUCTION_URL` é a reserva: vem sem protocolo e é
  // exposta sozinha pela Vercel, então um deploy novo já sai com o
  // canonical certo sem ninguém configurar nada. Só é lida no servidor
  // — `site.url` não aparece em nenhum componente de cliente, então não
  // há risco de o servidor e o navegador discordarem.
  url: normalizarUrl(
    process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
    "https://bigette.com.br",
  ),
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
