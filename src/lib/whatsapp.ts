import { site } from "@/config/site";

type WhatsAppOpts = {
  /** Texto da mensagem já preenchida */
  message?: string;
  /** De qual seção o clique veio — vira parâmetro rastreável */
  source?: string;
};

/**
 * Monta o link do WhatsApp com a mensagem pré-preenchida.
 * O `source` entra na própria mensagem, então dá para saber qual
 * gatilho converteu mesmo sem nenhuma ferramenta de analytics.
 */
export function whatsappUrl({ message, source }: WhatsAppOpts = {}): string {
  const base = message ?? site.whatsapp.defaultMessage;
  const text = source ? `${base}\n\n(vim da seção: ${source})` : base;
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(text)}`;
}

/** Telefone formatado para exibição: +55 (11) 99999-8888 */
export function whatsappDisplay(): string {
  const n = site.whatsapp.number;
  const ddi = n.slice(0, 2);
  const ddd = n.slice(2, 4);
  const rest = n.slice(4);
  const first = rest.length === 9 ? rest.slice(0, 5) : rest.slice(0, 4);
  const last = rest.length === 9 ? rest.slice(5) : rest.slice(4);
  return `+${ddi} (${ddd}) ${first}-${last}`;
}

/** Formato E.164 exigido pelo schema.org e pelos dados estruturados */
export function telE164(): string {
  return `+${site.whatsapp.number}`;
}
