"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import type { Palco } from "./cenas";
import { aguentaCena3D, progressoDoElemento } from "@/lib/motion";

type Props = {
  tipo: "varal" | "polaroides";
  /** elemento cujo avanço pela tela dirige a cena */
  refTrilho: RefObject<HTMLElement | null>;
  aoTrocarEstacao?: (i: number) => void;
  /** chamado a cada quadro com o progresso 0→1 do percurso */
  aoProgredir?: (p: number) => void;
  className?: string;
};

/**
 * Monta uma cena 3D dentro de uma seção.
 *
 * O laço de render só roda enquanto o trilho está na tela, e o módulo
 * do three.js só é importado se `aguentaCena3D()` aprovar o aparelho.
 * Quem não tem WebGL, pediu movimento reduzido, está no celular ou em
 * economia de dados nunca baixa esse chunk.
 */
const semInscricao = () => () => {};

export function Palco3D({ tipo, refTrilho, aoTrocarEstacao, aoProgredir, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Sem suporte, nem o <canvas> vazio entra no DOM.
  const tem3D = useSyncExternalStore(semInscricao, aguentaCena3D, () => false);
  // A callback vive num ref para que trocá-la não derrube e remonte a
  // cena inteira. A escrita mora num efeito: mexer em ref durante o
  // render é justamente o que o React pede para não fazer.
  const cbRef = useRef(aoTrocarEstacao);
  const progRef = useRef(aoProgredir);
  useEffect(() => {
    cbRef.current = aoTrocarEstacao;
    progRef.current = aoProgredir;
  }, [aoTrocarEstacao, aoProgredir]);

  useEffect(() => {
    // `tem3D` PRECISA estar nas dependências. O useSyncExternalStore
    // devolve false na hidratação e true logo depois; sem ele aqui, o
    // efeito rodava uma vez só, quando o <canvas> ainda nem existia, e
    // a cena nunca era criada.
    if (!tem3D) return;
    const canvas = canvasRef.current;
    const trilho = refTrilho.current;
    if (!canvas || !trilho) return;

    let palco: Palco | null = null;
    let vivo = true;
    let raf = 0;
    let obs: IntersectionObserver | null = null;
    const desliga: Array<() => void> = [];

    (async () => {
      const mod = await import("./cenas");
      if (!vivo) return;
      palco = tipo === "varal" ? mod.criarVaral(canvas) : mod.criarPolaroides(canvas);
      palco.aoTrocarEstacao = (i) => cbRef.current?.(i);
      palco.aoProgredir = (p) => progRef.current?.(p);
      palco.setProgresso(progressoDoElemento(trilho));

      let agendado = false;
      const onScroll = () => {
        if (agendado) return;
        agendado = true;
        raf = requestAnimationFrame(() => {
          agendado = false;
          palco?.setProgresso(progressoDoElemento(trilho));
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      desliga.push(() => window.removeEventListener("scroll", onScroll));

      const onResize = () => palco?.redimensionar();
      window.addEventListener("resize", onResize, { passive: true });
      desliga.push(() => window.removeEventListener("resize", onResize));

      obs = new IntersectionObserver(
        ([e]) => palco?.setAtivo(e.isIntersecting && !document.hidden),
        { rootMargin: "10% 0px" },
      );
      obs.observe(trilho);

      const onVis = () => palco?.setAtivo(!document.hidden);
      document.addEventListener("visibilitychange", onVis);
      desliga.push(() => document.removeEventListener("visibilitychange", onVis));
    })();

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      desliga.forEach((f) => f());
      obs?.disconnect();
      palco?.destruir();
    };
  }, [tipo, refTrilho, tem3D]);

  if (!tem3D) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
    />
  );
}
