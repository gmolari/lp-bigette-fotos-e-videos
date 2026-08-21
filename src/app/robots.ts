import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * Gera /robots.txt
 * Bots de busca liberados. Scrapers de IA de treino bloqueados —
 * as fotos são o ativo da Bigette. Bots de BUSCA com IA (ex.: OAI-SearchBot,
 * PerplexityBot) continuam liberados, porque eles mandam tráfego de volta.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/static/chunks/"],
      },
      // Buscadores principais — explícito para não haver dúvida
      { userAgent: ["Googlebot", "Googlebot-Image", "Bingbot"], allow: "/" },
      // Buscadores com IA que geram tráfego de volta — permitidos
      { userAgent: ["OAI-SearchBot", "PerplexityBot"], allow: "/" },
      // Scrapers de treino de modelo — bloqueados (protege as fotos)
      {
        userAgent: [
          "GPTBot",
          "CCBot",
          "ClaudeBot",
          "anthropic-ai",
          "Google-Extended",
          "Applebot-Extended",
          "Bytespider",
          "meta-externalagent",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
