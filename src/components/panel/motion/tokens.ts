import type { Transition, Variants } from "motion/react";

/**
 * Tokens de movimento do painel. Espelham as curvas de `globals.css`
 * (`--ease-out`, `--ease-inout`, `--ease-spring`) para CSS e Motion
 * falarem a mesma língua. Spec: .claude/design-system/motion.md
 */

/** Segundos (Motion usa segundos; CSS, ms). */
export const duration = {
  instant: 0.1, // feedback de toque
  fast: 0.18, // hover, saída
  base: 0.28, // entrada de elemento pequeno
  slow: 0.44, // entrada de bloco (igual a MS_ENTRADA_PARADA da LP)
  slower: 0.7, // entrada de página
} as const;

export const ease = {
  out: [0.16, 1, 0.3, 1], // entrada: arranca forte, pousa suave
  inOut: [0.65, 0, 0.35, 1], // deslocamento que começa e termina parado
  spring: [0.34, 1.42, 0.64, 1], // leve passada do ponto
} as const;

export const spring = {
  /** Botão, toggle — responde já, sem balançar. */
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.6 },
  /** Cartão, painel — assenta com um respiro. */
  gentle: { type: "spring", stiffness: 260, damping: 26 },
} as const satisfies Record<string, Transition>;

/** Entrada padrão: sobe 12px e aparece. Saída mais curta que a entrada. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
  exit: { opacity: 0, y: -6, transition: { duration: duration.fast, ease: ease.out } },
};

/** Foco de lente: chega desfocado e resolve — o mesmo gesto do hero da LP. */
export const focusIn: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", scale: 0.985 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: duration.slower, ease: ease.out },
  },
};

/** Escalonamento de lista: 60ms entre filhos. */
export const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

/** Erro de formulário: tremida curta. Com movimento reduzido, o MotionConfig anula. */
export const shake = {
  x: [0, -7, 7, -4, 4, 0],
  transition: { duration: 0.36, ease: ease.inOut },
};
