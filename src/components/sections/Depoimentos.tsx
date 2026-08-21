import { Quote } from "lucide-react";
import { Section, Eyebrow, Title } from "@/components/ui/Section";
import { Gatilho } from "@/components/ui/Gatilho";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/config/content";

export function Depoimentos() {
  const c = content.depoimentos;
  return (
    <Section id="depoimentos">
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <Title>{c.title}</Title>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {c.itens.map((d, i) => (
          <Reveal key={d.frase} variante="up" delay={i * 100}>
            <figure className="h-full rounded-[20px] border border-line bg-bg-2 px-7 py-8">
              <Quote
                size={20}
                strokeWidth={1.6}
                aria-hidden="true"
                className="mb-4 text-accent/55"
              />
              <blockquote className="mb-4 font-display-italico text-[23px] leading-tight text-cream italic">
                {d.frase}
              </blockquote>
              <figcaption className="text-[12px] tracking-[0.16em] text-ouro uppercase">
                {d.contexto}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <Gatilho {...c.gatilho} source="depoimentos" />
    </Section>
  );
}
