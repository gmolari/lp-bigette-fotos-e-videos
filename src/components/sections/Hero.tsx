"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { CalendarDays, ChevronDown } from "lucide-react";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/config/content";
import { site } from "@/config/site";
import { damp, semMovimento } from "@/lib/motion";
import type { FotoPortfolio } from "@/lib/portfolio-tipos";

/**
 * O HERO
 *
 * Profundidade aqui não vem de 3D — vem de quatro camadas andando em
 * velocidades diferentes. É o mesmo princípio de um fundo de teatro:
 * o que está longe se move menos.
 *
 *   foto      ── mais lenta que a página, e ainda deriva sozinha
 *   véu       ── velocidade intermediária
 *   texto     ── acompanha a página, e contra-move ao ponteiro
 *   seta      ── fixa embaixo
 *
 * Por cima disso, o ponteiro afasta as camadas em sentidos opostos: é
 * a separação entre elas que o olho lê como profundidade, mais do que
 * o deslocamento em si.
 *
 * E a entrada é um focus pull — a foto chega desfocada e resolve. Numa
 * página de fotógrafa, o primeiro gesto ser o de uma lente encontrando
 * o assunto vale mais que qualquer transição genérica.
 *
 * Tudo escreve em custom properties do DOM a partir de UM laço de rAF.
 * Passar isso por estado do React seria um render por quadro de scroll.
 */
export function Hero({ foto }: { foto: FotoPortfolio }) {
  const raizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz || semMovimento()) return;

    // Sem ponteiro fino (celular, tablet) só o scroll dirige as camadas.
    const temPonteiro = window.matchMedia("(pointer: fine)").matches;

    const alvo = { px: 0, py: 0 };
    const suave = { px: 0, py: 0 };
    let scroll = 0;
    let raf = 0;
    let ultimo = performance.now();
    let dentro = true;

    function onPonteiro(e: PointerEvent) {
      alvo.px = (e.clientX / window.innerWidth) * 2 - 1;
      alvo.py = (e.clientY / window.innerHeight) * 2 - 1;
    }

    function quadro(agora: number) {
      raf = requestAnimationFrame(quadro);
      const dt = Math.min((agora - ultimo) / 1000, 0.05);
      ultimo = agora;

      // Fora da tela não há o que animar — o laço continua, mas nada
      // é escrito no DOM e o compositor fica quieto.
      if (!dentro) return;

      scroll = window.scrollY;
      suave.px = damp(suave.px, alvo.px, 3.2, dt);
      suave.py = damp(suave.py, alvo.py, 3.2, dt);

      const e = raiz!.style;
      // foto: a mais lenta, e a que mais reage ao ponteiro
      e.setProperty("--foto-y", `${scroll * 0.34}px`);
      e.setProperty("--foto-x", `${suave.px * 16}px`);
      e.setProperty("--foto-py", `${suave.py * 11}px`);
      // véu: meio caminho
      e.setProperty("--veu-y", `${scroll * 0.16}px`);
      // texto: contra-move, que é o que separa as camadas
      e.setProperty("--texto-x", `${suave.px * -7}px`);
      e.setProperty("--texto-y", `${suave.py * -4}px`);
    }

    const obs = new IntersectionObserver(([ent]) => (dentro = ent.isIntersecting));
    obs.observe(raiz);

    if (temPonteiro) window.addEventListener("pointermove", onPonteiro, { passive: true });
    raf = requestAnimationFrame(quadro);

    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      if (temPonteiro) window.removeEventListener("pointermove", onPonteiro);
    };
  }, []);

  return (
    <div
      ref={raizRef}
      id="topo"
      className="relative z-1 flex min-h-[100svh] items-end overflow-hidden pb-28 sm:pb-20"
    >
      {/* CAMADA 1 — a foto.
          Três divs aninhadas de propósito: cada uma carrega UM transform.
          Empilhar a paralaxe, o focus pull e a deriva no mesmo elemento
          faria as três brigarem pela mesma propriedade. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-2 [transform:translate3d(var(--foto-x,0px),calc(var(--foto-y,0px)+var(--foto-py,0px)),0)] will-change-transform"
      >
        <div className="size-full animate-foco-hero">
          <div className="relative size-full animate-deriva-hero">
            {/* 🟡 /public/hero.jpg é PROVISÓRIA (Unsplash).
                Ver public/portfolio/CREDITOS.txt. */}
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[50%_35%]"
            />
          </div>
        </div>
      </div>

      {/* CAMADA 2 — o escurecimento, mais rápido que a foto e mais lento
          que o texto. Forte embaixo, onde mora a leitura; quase nada em
          cima, onde mora a fotografia. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-1 [transform:translate3d(0,var(--veu-y,0px),0)] bg-[linear-gradient(to_top,var(--color-bg)_4%,rgba(10,9,17,.84)_32%,rgba(10,9,17,.3)_70%,rgba(10,9,17,.52)_100%)]"
      />

      {/* CAMADA 3 — o conteúdo */}
      <div className="container-lp [transform:translate3d(var(--texto-x,0px),var(--texto-y,0px),0)]">
        <Reveal variante="left" imediato>
          <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold tracking-[0.24em] text-ouro uppercase">
            <span aria-hidden="true" className="h-px w-9 bg-ouro/70" />
            {content.hero.eyebrow} — {site.city}
          </p>
        </Reveal>

        <Reveal variante="cortina" delay={90} imediato>
          <h1 className="max-w-[15ch] font-display text-[clamp(42px,8vw,76px)] leading-[1.02] tracking-[-0.02em] [text-shadow:0_2px_28px_rgba(10,9,17,.55)]">
            {content.hero.title}
          </h1>
        </Reveal>

        <Reveal variante="up" delay={230} imediato>
          <p className="my-7 max-w-[54ch] text-[clamp(17px,2.1vw,21px)] leading-relaxed text-cream/80 [text-shadow:0_1px_16px_rgba(10,9,17,.6)]">
            {content.hero.lead}
          </p>
        </Reveal>

        <Reveal variante="up" delay={340} imediato>
          <WhatsAppButton source="hero" size="lg" seta>
            {content.hero.cta}
          </WhatsAppButton>
        </Reveal>

        <Reveal variante="up" delay={440} imediato>
          <p className="mt-7 flex items-center gap-2.5 text-sm text-cream/70">
            <CalendarDays
              size={16}
              strokeWidth={1.7}
              aria-hidden="true"
              className="shrink-0 text-accent"
            />
            {content.hero.selo}
          </p>
        </Reveal>
      </div>

      {/* CAMADA 4 — a seta, ancorada */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 text-accent/70 animate-cue"
      >
        <ChevronDown size={26} strokeWidth={1.5} />
      </span>
    </div>
  );
}
