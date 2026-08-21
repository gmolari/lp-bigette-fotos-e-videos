import { Section, Eyebrow, Title } from "@/components/ui/Section";
import { Gatilho } from "@/components/ui/Gatilho";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/config/content";

export function ComoFunciona() {
  const c = content.comoFunciona;
  return (
    <Section id="como-funciona">
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <Title>{c.title}</Title>

      {/* A numeração aqui carrega informação de verdade: é a ordem em que
          as coisas acontecem, do primeiro "oi" até a entrega. */}
      <ol className="relative mt-12 border-t border-line">
        {c.passos.map((p, i) => (
          <Reveal key={p.n} variante="up" delay={i * 110} as="li">
            <div className="flex items-start gap-6 border-b border-line py-8">
              <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line-forte font-display text-[22px] leading-none text-accent">
                {p.n}
              </span>
              <div>
                <h3 className="mb-2 text-xl font-semibold">
                  {p.title}
                </h3>
                <p className="text-[15.5px] leading-relaxed text-muted">
                  {p.text}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>

      <Gatilho {...c.gatilho} source="como-funciona" />
    </Section>
  );
}
