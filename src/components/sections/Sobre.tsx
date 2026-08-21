import { Section, Eyebrow, Title, Lead } from "@/components/ui/Section";
import { Gatilho } from "@/components/ui/Gatilho";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/config/content";

export function Sobre() {
  const c = content.sobre;
  return (
    <Section id="sobre" alt>
      <div className="grid items-center gap-9 md:grid-cols-2 md:gap-14">
        <Reveal variante="foco">
          <Placeholder label="Foto da Bigette" ratio="aspect-square" />
        </Reveal>
        <div>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <Title>{c.title}</Title>
          {c.paragrafos.map((p, i) => (
            <Lead key={p} className="mb-4" delay={140 + i * 90}>
              {p}
            </Lead>
          ))}
        </div>
      </div>
      <Gatilho {...c.gatilho} source="sobre" />
    </Section>
  );
}
