"use client";

import { useRef, type ReactNode } from "react";
import { semMovimento } from "@/lib/motion";

/**
 * Cartão que se inclina de leve na direção do ponteiro.
 *
 * O ângulo vai para duas custom properties (--tx/--ty) lidas pela
 * utility `cartao-tilt` no CSS. Escrever variável em vez de estilo
 * inline evita re-render do React a cada movimento do mouse.
 */
export function CartaoTilt({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function mover(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || semMovimento()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--tx", String((e.clientX - r.left) / r.width - 0.5));
    el.style.setProperty("--ty", String((e.clientY - r.top) / r.height - 0.5));
    el.style.setProperty("--lift", "-6px");
  }

  function sair() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tx", "0");
    el.style.setProperty("--ty", "0");
    el.style.setProperty("--lift", "0px");
  }

  return (
    <div
      ref={ref}
      onPointerMove={mover}
      onPointerLeave={sair}
      className={`cartao-tilt ${className}`}
    >
      {children}
    </div>
  );
}
