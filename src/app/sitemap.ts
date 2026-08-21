import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * Gera /sitemap.xml
 * Hoje é uma página só. Quando criar páginas por serviço ou por cidade,
 * basta adicionar aqui — o Next gera o XML automaticamente.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
