import Image from "next/image";
import { Section, Eyebrow, Title, Lead } from "@/components/ui/Section";
import { Gatilho } from "@/components/ui/Gatilho";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/config/content";
import type { FotoPortfolio } from "@/lib/portfolio-tipos";

/**
 * A foto vem do painel (/sections → Sobre). Sem ela, espaço reservado —
 * nunca um rosto qualquer no lugar do dela (docs/06-pendencias.md).
 */
export function Sobre({ foto }: { foto: FotoPortfolio | null }) {
  const c = content.sobre;
  return (
    <Section id="sobre" alt>
      <div className="grid items-center gap-9 md:grid-cols-2 md:gap-14">
        <Reveal variante="foco">
          {foto ? (
            <div className="relative aspect-square overflow-hidden rounded-[16px] bg-bg-2">
              <Image src={foto.src} alt={foto.alt} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
            </div>
          ) : (
            <Placeholder label={c.reservado} ratio="aspect-square" />
          )}
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
