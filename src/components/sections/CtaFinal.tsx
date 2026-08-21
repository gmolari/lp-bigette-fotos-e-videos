"use client";

import { useRef } from "react";
import { Clock, MapPin } from "lucide-react";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Reveal } from "@/components/ui/Reveal";
import { Palco3D } from "@/components/three/Palco3D";
import { content } from "@/config/content";
import { site } from "@/config/site";

/**
 * O fecho. Atrás do texto, um carrossel lento de polaroides reveladas —
 * ambiente, não dirigido pelo scroll. É a última imagem que fica: o
 * trabalho já pronto, na mão.
 *
 * Sem 3D, a seção continua inteira: só perde o fundo.
 */
export function CtaFinal() {
  const c = content.final;
  const trilho = useRef<HTMLElement>(null);

  return (
    <section
      id="contato"
      ref={trilho}
      className="relative z-1 overflow-hidden bg-bg py-28 text-center sm:py-[132px]"
    >
      <Palco3D tipo="polaroides" refTrilho={trilho} />

      {/* véu radial discreto: abre no centro, onde fica o texto */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(52%_54%_at_50%_48%,rgba(10,9,17,.9)_0%,rgba(10,9,17,.62)_62%,rgba(10,9,17,.25)_100%)]"
      />

      <div className="container-lp relative">
        <Reveal variante="up">
          <p className="mb-5 flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.24em] text-ouro uppercase">
            <span aria-hidden="true" className="h-px w-9 bg-ouro/70" />
            {c.eyebrow}
          </p>
        </Reveal>
        <Reveal variante="cortina" delay={60}>
          <h2 className="mx-auto mb-6 max-w-[17ch] font-display text-[clamp(30px,5vw,50px)] leading-[1.08] tracking-[-0.015em]">
            {c.title}
          </h2>
        </Reveal>
        <Reveal variante="up" delay={160}>
          <p className="mx-auto mb-9 max-w-[52ch] text-[clamp(17px,2.1vw,21px)] leading-relaxed text-cream/75">
            {c.lead}
          </p>
        </Reveal>
        <Reveal variante="up" delay={260}>
          <WhatsAppButton source="cta-final" size="lg" seta>
            {c.cta}
          </WhatsAppButton>
        </Reveal>
        <Reveal variante="up" delay={360}>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-2">
              <Clock size={15} strokeWidth={1.7} aria-hidden="true" className="text-accent" />
              {site.horarioAtendimento}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={15} strokeWidth={1.7} aria-hidden="true" className="text-accent" />
              {site.region}
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
