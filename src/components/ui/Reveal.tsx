"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Variante =
  | "up"
  | "down"
  | "left"
  | "right"
  | "scale"
  /** desfoca e "foca", como uma lente resolvendo a imagem */
  | "foco"
  /** o conteúdo sobe de trás de uma cortina invisível */
  | "cortina";

type Tag = "div" | "li" | "article" | "figure" | "section" | "span" | "p";

type Props = {
  children: ReactNode;
  as?: Tag;
  variante?: Variante;
  /** atraso em ms — é com isso que se faz o escalonamento de listas */
  delay?: number;
  className?: string;
  /** fração do elemento que precisa aparecer para disparar */
  limiar?: number;
  /** false = anima toda vez que entra e sai da tela */
  umaVez?: boolean;
};

/**
 * Revela o conteúdo quando ele entra na tela.
 *
 * Usa IntersectionObserver (sem listener de scroll, sem custo por frame) e
 * só mexe em opacity/transform/filter, que o compositor resolve na GPU.
 * As variantes e as curvas moram em globals.css.
 */
export function Reveal({
  children,
  as = "div",
  variante = "up",
  delay = 0,
  className = "",
  limiar = 0.16,
  umaVez = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sem suporte a observer: mostra e pronto. Nunca esconder por acidente.
    // Marca o nó direto em vez de passar por estado — não há nada para
    // o React coordenar aqui, e setState dentro de efeito encadeia render.
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.shown = "true";
      return;
    }

    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true);
          if (umaVez) obs.unobserve(el);
        } else if (!umaVez) {
          setVisivel(false);
        }
      },
      // A margem negativa embaixo faz o elemento esperar entrar de verdade
      // no campo de visão, em vez de disparar assim que raspa a borda.
      { threshold: limiar, rootMargin: "0px 0px -10% 0px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [limiar, umaVez]);

  const Comp = as as "div";

  return (
    <Comp
      ref={ref}
      className={className}
      data-reveal={variante}
      data-shown={visivel ? "true" : undefined}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Comp>
  );
}
