"use client";

import { useEffect, useState } from "react";
import { whatsappUrl } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/components/analytics/track";
import { IconeWhatsApp } from "@/components/ui/icons";

/**
 * Botão redondo, sem texto. Só entra depois do hero — lá em cima a
 * pessoa já tem o botão grande na frente, e dois convites ao mesmo
 * tempo é insistência.
 *
 * O anel de pulso é irmão do botão dentro de um contêiner de tamanho
 * fixo, não filho dele: antes ele herdava o `hover:-translate-y` do
 * botão e a animação saía do centro.
 */
export function WhatsAppFloat() {
  const [dentro, setDentro] = useState(false);

  useEffect(() => {
    let agendado = false;
    const aplicar = () => {
      agendado = false;
      setDentro(window.scrollY > window.innerHeight * 0.75);
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
    <div
      className={`fixed right-5 bottom-5 z-95 size-14 transition-[opacity,transform] duration-500 ease-[var(--ease-out)] sm:right-7 sm:bottom-7 ${
        dentro
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {dentro && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-wpp/35 animate-halo"
        />
      )}
      <a
        href={whatsappUrl({ source: "botao-flutuante" })}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick("botao-flutuante")}
        aria-label="Falar com a Bigette no WhatsApp"
        className="absolute inset-0 grid place-items-center rounded-full bg-wpp text-wpp-ink shadow-[0_6px_22px_rgba(0,0,0,.45)] transition-colors duration-300 hover:bg-[#2ee275]"
      >
        <IconeWhatsApp className="size-6" />
      </a>
    </div>
  );
}
