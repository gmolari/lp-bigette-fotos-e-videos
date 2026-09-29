"use client";

import { m, type HTMLMotionProps } from "motion/react";
import { spring } from "../motion/tokens";
import { Spinner } from "./Spinner";

/** Spec: .claude/design-system/components.md → Button */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-ink hover:bg-accent-2",
  secondary: "border border-line-forte text-cream hover:border-accent hover:text-accent-2",
  ghost: "text-muted hover:bg-bg-3 hover:text-cream",
  danger: "bg-erro text-erro-ink hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[0.95rem] gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Texto durante `loading`. Sem ele, mantém o rótulo. */
  loadingLabel?: string;
  fullWidth?: boolean;
  /**
   * Ícone à esquerda do texto. NUNCA ponha o ícone dentro de `children`:
   * o texto vai num <span>, e o reset do Tailwind faz todo <svg> ser
   * `display: block` — o ícone ocupa uma linha e o rótulo cai para a de
   * baixo, estourando a altura fixa do botão. Aconteceu no "Adicionar fotos".
   */
  icon?: React.ReactNode;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel,
  fullWidth = false,
  icon,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const inactive = disabled || loading;

  return (
    <m.button
      type={type}
      disabled={inactive}
      aria-busy={loading || undefined}
      whileTap={inactive ? undefined : { scale: 0.97 }}
      transition={spring.snappy}
      className={[
        "inline-flex select-none items-center justify-center rounded-full font-semibold",
        "transition-[background-color,border-color,color,filter,opacity] duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        loading ? "disabled:opacity-80" : "",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
    </m.button>
  );
}
