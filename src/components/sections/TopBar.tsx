"use client";

import { useEffect, useRef, useState } from "react";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { site } from "@/config/site";
import { progressoDaPagina } from "@/lib/motion";

/**
 * Barra fixa. Ela NÃO se esconde ao rolar — a versão anterior sumia
 * ao descer e voltava ao subir, o que na prática lê como falha, não
 * como recurso. Fica sempre presente; o que muda é só o fundo, que
 * ganha corpo assim que sai do topo.
 *
 * O fio de progresso é escrito direto numa custom property do DOM:
 * passar por estado do React provocaria um render a cada quadro.
 */
export function TopBar() {
  const [rolou, setRolou] = useState(false);
  const fioRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let agendado = false;
    const aplicar = () => {
      agendado = false;
      setRolou(window.scrollY > 24);
      fioRef.current?.style.setProperty("--p", String(progressoDaPagina()));
    };
    const onScroll = () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(aplicar);
    };
    aplicar();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-90 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ease-[var(--ease-out)] ${
        rolou
          ? "border-line bg-bg/85 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="container-lp flex h-[64px] items-center justify-between">
        <a
          href="#topo"
          className="font-display text-[20px] tracking-tight text-cream no-underline"
        >
          {site.shortName} <span className="text-accent">Fotos e Vídeos</span>
        </a>
        {/* Um <span> só. Antes eram dois nós irmãos dentro de um
            inline-flex com `gap`, então o espaçamento do flex ENTRAVA
            entre "Chamar no" e "WhatsApp" — somado ao &nbsp;, virava
            um buraco. Agora é um item de flex único e o espaço é o
            espaço normal da frase. */}
        <WhatsAppButton source="barra-fixa" size="sm">
          <span>
            <span className="max-sm:hidden">Chamar no </span>WhatsApp
          </span>
        </WhatsAppButton>
      </div>

      <span
        ref={fioRef}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[-1px] h-px origin-left bg-accent"
        style={{ transform: "scaleX(var(--p, 0))" }}
      />
    </header>
  );
}
