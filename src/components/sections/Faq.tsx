"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Section, Eyebrow, Title } from "@/components/ui/Section";
import { Gatilho } from "@/components/ui/Gatilho";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/config/content";
import { fillTokens } from "@/lib/tokens";

/**
 * Sanfona acessível.
 *
 * Trocou o <details> nativo porque ele abre e fecha sem transição. Aqui
 * a altura anima por grid-template-rows 0fr→1fr, que é a única forma
 * puramente CSS de animar altura automática — nada é medido em JS.
 *
 * A resposta continua sempre no HTML (só recortada), então buscador e
 * leitor de tela leem tudo mesmo com o item fechado. O FAQPage do
 * JSON-LD é gerado à parte, em src/lib/jsonld.ts.
 */
export function Faq() {
  const c = content.faq;
  const [aberto, setAberto] = useState<number | null>(
    c.itens.findIndex((i) => "aberto" in i && i.aberto),
  );

  return (
    <Section id="faq">
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <Title>{c.title}</Title>

      <div className="mt-12 border-t border-line">
        {c.itens.map((item, i) => {
          const estaAberto = aberto === i;
          return (
            <Reveal key={item.q} variante="up" delay={i * 70}>
              <div className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    onClick={() => setAberto(estaAberto ? null : i)}
                    aria-expanded={estaAberto}
                    aria-controls={`faq-resposta-${i}`}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 py-6 text-left text-lg font-semibold transition-colors duration-300 hover:text-lilas-200"
                  >
                    {fillTokens(item.q)}
                    <Plus
                      size={22}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className={`shrink-0 text-accent transition-transform duration-500 ease-[var(--ease-spring)] ${
                        estaAberto ? "rotate-[135deg]" : "rotate-0"
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-resposta-${i}`}
                  className={`sanfona ${estaAberto ? "sanfona-aberta" : ""}`}
                >
                  <div>
                    <p className="max-w-[62ch] pb-6 text-base leading-relaxed text-muted">
                      {fillTokens(item.a)}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Gatilho {...c.gatilho} source="faq" />
    </Section>
  );
}
