import { Section, Eyebrow, Title, Lead } from "@/components/ui/Section";
import { Gatilho } from "@/components/ui/Gatilho";
import { Reveal } from "@/components/ui/Reveal";
import { CartaoTilt } from "@/components/ui/CartaoTilt";
import { content } from "@/config/content";
import type { SectionTexts } from "@/modules/sections/domain/texts";

/** O título e o texto dos cartões vêm do painel (/sections → Experiência). */
export function Experiencia({ textos }: { textos: SectionTexts["experience"] }) {
  const c = content.experiencia;
  return (
    <Section id="experiencia">
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <Title>{c.title}</Title>
      <Lead>{c.lead}</Lead>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {textos.cards.map((card, i) => (
          <Reveal key={i} variante="up" delay={i * 110} as="article">
            <CartaoTilt className="h-full rounded-[20px] border border-line bg-bg-2 px-7 py-8">
              {/* A numeração fica porque estes três cartões são de fato
                  uma sequência: os dez minutos, depois a direção, depois
                  a entrega. Se virarem itens soltos, o número sai. */}
              <span className="mb-5 block font-display text-[38px] leading-none text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-3 text-xl leading-tight font-semibold">
                {card.title}
              </h3>
              <p className="text-[15.5px] leading-relaxed text-muted">
                {card.text}
              </p>
            </CartaoTilt>
          </Reveal>
        ))}
      </div>

      <Gatilho {...c.gatilho} source="experiencia" />
    </Section>
  );
}
