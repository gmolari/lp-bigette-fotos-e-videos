"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import type { Palco } from "./cenas";
import type { FotoPortfolio } from "@/lib/portfolio-tipos";
import { aguentaCena3D, progressoDoElemento } from "@/lib/motion";

type Props = {
  tipo: "varal" | "polaroides";
  /** Vêm do servidor, já no HTML. Viram as texturas dos prints/polaroides. */
  fotos: FotoPortfolio[];
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

export function Palco3D({ tipo, fotos, refTrilho, aoTrocarEstacao, aoProgredir, className = "" }: Props) {
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

    /**
     * O chunk do three.js (130 KB gzip) só é BAIXADO quando o trilho
     * chega perto da tela — não no mount.
     *
     * Enquanto a cena era só de desktop isso não pesava. Com celular
     * incluído, importar no mount põe 130 KB para disputar banda com a
     * foto do hero, que é o que a pessoa realmente está esperando ver.
     * Uma tela e meia de antecedência dá tempo de sobra para baixar e
     * montar antes de a seção aparecer.
     */
    const iniciar = async () => {
      const mod = await import("./cenas");
      if (!vivo) return;
      palco = tipo === "varal" ? mod.criarVaral(canvas, fotos) : mod.criarPolaroides(canvas, fotos);
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
    };

    // Observador só para disparar o download, com antecedência bem
    // maior que a do observador de "está na tela" criado lá dentro.
    const aproximacao = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        aproximacao.disconnect();
        void iniciar();
      },
      { rootMargin: "150% 0px" },
    );
    aproximacao.observe(trilho);

    return () => {
      vivo = false;
      aproximacao.disconnect();
      cancelAnimationFrame(raf);
      desliga.forEach((f) => f());
      obs?.disconnect();
      palco?.destruir();
    };
  }, [tipo, fotos, refTrilho, tem3D]);

  if (!tem3D) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
    />
  );
}
