"use client";

import { ArrowUpRight } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/components/analytics/track";
import { IconeWhatsApp } from "./icons";

type Props = {
  children: React.ReactNode;
  /** Nome da seção — vai no evento de analytics e na própria mensagem */
  source: string;
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "wpp" | "accent" | "contorno";
  className?: string;
  showIcon?: boolean;
  /** Seta de "abre em outro lugar" à direita do texto */
  seta?: boolean;
};

const sizes = {
  sm: "px-4.5 py-2.5 text-[13.5px] gap-2",
  md: "px-6 py-3.5 text-[15px] gap-2.5",
  lg: "px-9 py-5 text-[17px] gap-3",
};

/* Hover contido de propósito: uma troca de tom e nada mais.
   A versão anterior levantava o botão e acendia um halo colorido —
   com onze botões na página, aquilo virava pisca-pisca. */
const variants = {
  wpp: "bg-wpp text-wpp-ink hover:bg-[#2ee275]",
  accent: "bg-accent text-ink hover:bg-lilas-300",
  contorno: "border border-line-forte text-cream hover:border-accent",
};

export function WhatsAppButton({
  children,
  source,
  message,
  size = "md",
  variant = "wpp",
  className = "",
  showIcon = true,
  seta = false,
}: Props) {
  return (
    <a
      href={whatsappUrl({ message, source })}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick(source)}
      aria-label={`${typeof children === "string" ? children : "Falar no WhatsApp"} — abre o WhatsApp`}
      className={`group inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight no-underline transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-out)] active:scale-[0.98] active:duration-75 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {showIcon && (
        <IconeWhatsApp />
      )}
      {children}
      {seta && (
        <ArrowUpRight
          size={17}
          strokeWidth={2.4}
          aria-hidden="true"
          className="shrink-0 transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-px group-hover:-translate-y-px"
        />
      )}
    </a>
  );
}
