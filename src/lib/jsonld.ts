import { site } from "@/config/site";
import { content } from "@/config/content";
import { fillTokens } from "@/lib/tokens";
import { telE164 } from "@/lib/whatsapp";

/**
 * Dados estruturados (schema.org / JSON-LD).
 * É isso que faz o Google entender que existe um negócio local de
 * fotografia, com área de atendimento, FAQ e avaliações — e é o que
 * habilita rich results na busca.
 */

const id = (path: string) => `${site.url}${path}`;

/** ProfessionalService + LocalBusiness — o núcleo do SEO local */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": id("/#business"),
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    telephone: telE164(),
    // Omitido quando vazio, como postalCode: dado ausente é melhor que
    // dado inventado — e um e-mail que não existe em dado estruturado
    // vira endereço de contato que ninguém lê.
    ...(site.email ? { email: site.email } : {}),
    image: id("/opengraph-image"),
    logo: id("/icon.png"),
    priceRange: "$$",
    currenciesAccepted: "BRL",
    paymentAccepted: "Pix, Cartão de Crédito, Dinheiro",
    knowsLanguage: "pt-BR",
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressRegion: site.state,
      addressCountry: site.country,
      // Campos vazios são omitidos: dado ausente é melhor que dado inventado.
      ...(site.postalCode ? { postalCode: site.postalCode } : {}),
      ...(site.streetAddress ? { streetAddress: site.streetAddress } : {}),
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    areaServed: site.areasAtendidas.map((c) => ({
      "@type": "City",
      name: c,
    })),
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: site.geo.lat,
        longitude: site.geo.lng,
      },
      geoRadius: site.serviceRadiusKm * 1000,
    },
    founder: { "@type": "Person", name: site.founder },
    sameAs: [`https://instagram.com/${site.instagram}`],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: telE164(),
      availableLanguage: ["Portuguese"],
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços",
      itemListElement: [
        "Ensaio fotográfico individual",
        "Ensaio gestante",
        "Ensaio em família",
        "Cobertura de eventos",
        "Fotografia de produto",
        "Vídeo para redes sociais",
      ].map((n) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: n, provider: { "@id": id("/#business") } },
      })),
    },
  };
}

/** FAQPage — habilita o acordeão de perguntas direto no resultado de busca */
export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": id("/#faq"),
    mainEntity: content.faq.itens.map((item) => ({
      "@type": "Question",
      name: fillTokens(item.q),
      acceptedAnswer: { "@type": "Answer", text: fillTokens(item.a) },
    })),
  };
}

/** WebSite — habilita sitelinks e busca interna */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": id("/#website"),
    url: site.url,
    name: site.name,
    inLanguage: "pt-BR",
    publisher: { "@id": id("/#business") },
  };
}

/** Person — ajuda a associar a marca à profissional */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": id("/#person"),
    name: site.founder,
    jobTitle: "Fotógrafa",
    worksFor: { "@id": id("/#business") },
    url: site.url,
    sameAs: [`https://instagram.com/${site.instagram}`],
  };
}

/** BreadcrumbList */
export function breadcrumbSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: site.url },
    ],
  };
}

/** Junta tudo num @graph só — mais limpo e menos propenso a erro */
export function allSchemas() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      localBusinessSchema(),
      websiteSchema(),
      personSchema(),
      faqSchema(),
      breadcrumbSchema(),
    ],
  };
}
