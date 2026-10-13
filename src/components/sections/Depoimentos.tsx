import { Quote } from "lucide-react";
import { Section, Eyebrow, Title } from "@/components/ui/Section";
import { Gatilho } from "@/components/ui/Gatilho";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/config/content";
import type { SectionTexts } from "@/modules/sections/domain/texts";

/**
 * Colunas no desktop conforme a quantidade: as frases vêm do painel e
 * podem ser de 1 a 8. Quatro colunas fixas deixariam um buraco com 3.
 */
const COLUNAS: Record<number, string> = {
  1: "max-w-md",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};
const COLUNAS_PADRAO = "sm:grid-cols-2 lg:grid-cols-4";

/** As frases vêm do painel (/sections → Depoimentos). */
export function Depoimentos({ textos }: { textos: SectionTexts["testimonials"] }) {
  const c = content.depoimentos;
  return (
    <Section id="depoimentos">
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <Title>{c.title}</Title>

      <div className={`mt-12 grid gap-4 ${COLUNAS[textos.items.length] ?? COLUNAS_PADRAO}`}>
        {textos.items.map((d, i) => (
          <Reveal key={i} variante="up" delay={i * 100}>
            <figure className="h-full rounded-[20px] border border-line bg-bg-2 px-7 py-8">
              <Quote
                size={20}
                strokeWidth={1.6}
                aria-hidden="true"
                className="mb-4 text-accent/55"
              />
              <blockquote className="mb-4 font-display-italico text-[23px] leading-tight text-cream italic">
                {d.quote}
              </blockquote>
              <figcaption className="text-[12px] tracking-[0.16em] text-ouro uppercase">
                {d.context}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <Gatilho {...c.gatilho} source="depoimentos" />
    </Section>
  );
}
