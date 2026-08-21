import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/config/content";

export function FaixaImpacto() {
  return (
    <div className="relative z-1 bg-accent py-16 text-center text-ink">
      <div className="container-lp">
        <p className="mx-auto max-w-[22ch] font-display text-[clamp(24px,4vw,38px)] leading-tight">
          <Reveal as="span" variante="cortina" className="block">
            {content.faixa[0]}
          </Reveal>
          <Reveal as="span" variante="cortina" delay={180} className="block">
            {content.faixa[1]}
          </Reveal>
        </p>
      </div>
    </div>
  );
}
