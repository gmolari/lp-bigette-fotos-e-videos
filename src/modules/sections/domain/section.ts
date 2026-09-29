import { z } from "zod";
import type { Orientation } from "../../pictures/domain/picture";

/**
 * As seções da página que recebem fotos do banco. Compartilhado
 * cliente/servidor: o painel mostra as regras, a LP as aplica.
 *
 * Spec: .claude/specs/006-sections.md · vídeo: 007-media-inventory.md
 */

/** Na ORDEM EM QUE APARECEM NA PÁGINA — é a ordem do painel. */
export const SECTION_KEYS = ["hero", "portfolio", "video", "about", "closing"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export type SectionRule = {
  /** Quantos lugares a seção tem de verdade. */
  slots: number;
  /** Onde nenhuma repete e nenhuma sobra (= slots nas cinco). */
  ideal: number;
  /**
   * Completa com as fotos provisórias quando falta? Só onde a provisória
   * é paisagem genérica. Na foto da Bigette e na capa do vídeo, NÃO:
   * "pôr um rosto qualquer no lugar do dela seria pior que o espaço
   * vazio" (docs/06-pendencias.md). Vazias, mostram o espaço reservado.
   */
  fallback: boolean;
  /** Orientação que o enquadramento pede. `null` = tanto faz. */
  preferred: Orientation | null;
  /** Largura mínima para não borrar onde ela ocupa a tela toda. */
  minWidth?: number;
};

/**
 * Lugares tirados do código, não escolhidos:
 *   hero      → foto de fundo em tela cheia (Hero.tsx, sizes 100vw)
 *   portfolio → `N = 7` prints em cenas.ts
 *   video     → a capa do vídeo (Video.tsx)
 *   about     → a foto da Bigette (Sobre.tsx)
 *   closing   → `QTD = 12` polaroides em cenas.ts
 * ⚠️ Mudou N ou QTD em cenas.ts? Mude aqui.
 */
export const SECTION_RULES: Record<SectionKey, SectionRule> = {
  hero: { slots: 1, ideal: 1, fallback: true, preferred: "landscape", minWidth: 1920 },
  portfolio: { slots: 7, ideal: 7, fallback: true, preferred: null },
  video: { slots: 1, ideal: 1, fallback: false, preferred: null },
  about: { slots: 1, ideal: 1, fallback: false, preferred: null },
  closing: { slots: 12, ideal: 12, fallback: true, preferred: null },
};

/**
 * A partir de quantas fotos elas podem REPETIR para preencher os
 * lugares. Abaixo disso, as fotos da seção entram uma vez cada e o
 * resto é completado com as provisórias — uma foto só, repetida sete
 * vezes num varal, parece erro, não portfólio.
 */
export const REPEAT_FROM = 4;

/**
 * Monta a lista final de uma seção.
 *
 *   0 fotos           → só as provisórias (lista vazia se a seção não tem)
 *   1 a REPEAT_FROM-1 → as da seção, uma vez cada, + provisórias até `slots`
 *   REPEAT_FROM ou +  → só as da seção; quem consome cicla (cenas.ts: i % n)
 *                       ou corta nos `slots`
 *
 * Genérica de propósito: a LP chama com o formato dela.
 */
export function resolveSection<T>(assigned: T[], fallback: T[], slots: number): T[] {
  if (assigned.length === 0) return fallback;
  if (assigned.length >= REPEAT_FROM || slots <= assigned.length || fallback.length === 0) return assigned;
  const missing = slots - assigned.length;
  const filler = Array.from({ length: missing }, (_, i) => fallback[i % fallback.length]);
  return [...assigned, ...filler];
}

export type SectionStatus =
  | { kind: "empty" }
  | { kind: "filled-with-defaults"; defaults: number; toOwn: number }
  | { kind: "repeating"; toIdeal: number }
  | { kind: "complete" }
  | { kind: "overflow"; extra: number };

/** O que o painel diz de cada seção. Mesma aritmética de `resolveSection`. */
export function sectionStatus(key: SectionKey, count: number): SectionStatus {
  const { slots, ideal } = SECTION_RULES[key];
  if (count === 0) return { kind: "empty" };
  if (count > slots) return { kind: "overflow", extra: count - slots };
  if (count === ideal) return { kind: "complete" };
  if (count < REPEAT_FROM) return { kind: "filled-with-defaults", defaults: slots - count, toOwn: REPEAT_FROM - count };
  return { kind: "repeating", toIdeal: ideal - count };
}

const sectionField = z.enum(SECTION_KEYS);

export const assignPicturesSchema = z.object({
  section: sectionField,
  pictureIds: z.array(z.uuid()).min(1).max(50),
});

export const unassignPictureSchema = z.object({
  section: sectionField,
  pictureId: z.uuid(),
});

/** A ordem nova INTEIRA da seção, do primeiro ao último. */
export const reorderSectionSchema = z.object({
  section: sectionField,
  pictureIds: z.array(z.uuid()).min(1).max(200),
});
