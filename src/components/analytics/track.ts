"use client";

/**
 * Dispara um evento de conversão nas ferramentas que estiverem ligadas.
 * Chamado sempre que alguém clica em um CTA de WhatsApp.
 * Se nenhuma ferramenta estiver configurada, não faz nada e não quebra.
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackWhatsAppClick(source: string) {
  if (typeof window === "undefined") return;

  window.gtag?.("event", "contato_whatsapp", {
    event_category: "engagement",
    event_label: source,
    value: 1,
  });

  window.fbq?.("track", "Contact", { content_name: source });

  window.dataLayer?.push({ event: "contato_whatsapp", secao: source });
}
