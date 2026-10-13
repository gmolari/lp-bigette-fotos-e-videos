import { Reveal } from "@/components/ui/Reveal";
import type { SectionTexts } from "@/modules/sections/domain/texts";

/** As duas frases vêm do painel (/sections → Faixa de impacto). */
export function FaixaImpacto({ textos }: { textos: SectionTexts["band"] }) {
  return (
    <div className="relative z-1 bg-accent py-16 text-center text-ink">
      <div className="container-lp">
        <p className="mx-auto max-w-[22ch] font-display text-[clamp(24px,4vw,38px)] leading-tight">
          <Reveal as="span" variante="cortina" className="block">
            {textos.first}
          </Reveal>
          <Reveal as="span" variante="cortina" delay={180} className="block">
            {textos.second}
          </Reveal>
        </p>
      </div>
    </div>
  );
}
