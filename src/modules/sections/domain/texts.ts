import { z } from "zod";
import { content } from "@/config/content";
import { panelContent } from "@/config/panel-content";
import type { SectionKey } from "./section";

/**
 * Os textos da página que o painel pode alterar. Compartilhado
 * cliente/servidor: o painel valida com os mesmos esquemas que a action.
 *
 * O PADRÃO de cada texto continua em `src/config/content.ts`. O banco só
 * guarda o que foi personalizado, seção por seção; sem linha no banco, a
 * página mostra o padrão — e "voltar ao padrão" é apagar a linha.
 *
 * O que NÃO está aqui continua fixo no código, de propósito (escolhido
 * campo a campo na spec 008): eyebrows fora o do banner, títulos de
 * Experiência/Depoimentos/FAQ, todos os gatilhos menos o do vídeo, e as
 * seções Varal, Como funciona e CTA final inteiras.
 *
 * Spec: .claude/specs/008-section-texts.md
 */

const v = panelContent.sections.texts.validation;

/** Na ordem em que aparecem na página. */
export const TEXT_SECTION_KEYS = ["hero", "band", "experience", "testimonials", "video", "about", "faq"] as const;
export type TextSectionKey = (typeof TEXT_SECTION_KEYS)[number];

const line = (max: number) =>
  z
    .string()
    .trim()
    .min(1, { error: v.required })
    .max(max, { error: v.tooLong(max) });

const list = <T extends z.ZodType>(item: T, min: number, max: number) =>
  z
    .array(item)
    .min(min, { error: v.listMin(min) })
    .max(max, { error: v.listMax(max) });

/**
 * Quantos itens cada lista aceita. Os 3 cartões de Experiência são uma
 * sequência numerada: a quantidade não muda.
 */
export const TEXT_LIMITS = {
  cards: { min: 3, max: 3 },
  testimonials: { min: 1, max: 8 },
  paragraphs: { min: 1, max: 4 },
  faq: { min: 1, max: 12 },
} as const;
const L = TEXT_LIMITS;

export const textSchemas = {
  hero: z.object({ eyebrow: line(60), title: line(120), lead: line(400), seal: line(160) }),
  band: z.object({ first: line(120), second: line(120) }),
  experience: z.object({
    cards: list(z.object({ title: line(80), text: line(400) }), L.cards.min, L.cards.max),
  }),
  testimonials: z.object({
    items: list(z.object({ quote: line(160), context: line(60) }), L.testimonials.min, L.testimonials.max),
  }),
  video: z.object({ title: line(120), lead: line(400), triggerPhrase: line(160), triggerCta: line(40) }),
  about: z.object({ title: line(80), paragraphs: list(line(600), L.paragraphs.min, L.paragraphs.max) }),
  /** A PRIMEIRA pergunta é a que abre aberta na página (decisão D1: "Quanto custa?"). */
  faq: z.object({
    items: list(z.object({ q: line(160), a: line(800) }), L.faq.min, L.faq.max),
  }),
} satisfies Record<TextSectionKey, z.ZodObject>;

export type SectionTexts = { [K in TextSectionKey]: z.output<(typeof textSchemas)[K]> };

/** O padrão, tirado de `content.ts`. É o que vale enquanto ninguém personalizar. */
export const DEFAULT_TEXTS: SectionTexts = {
  hero: {
    eyebrow: content.hero.eyebrow,
    title: content.hero.title,
    lead: content.hero.lead,
    seal: content.hero.selo,
  },
  band: { first: content.faixa[0], second: content.faixa[1] },
  experience: { cards: content.experiencia.cards.map(({ title, text }) => ({ title, text })) },
  testimonials: {
    items: content.depoimentos.itens.map((d) => ({ quote: d.frase, context: d.contexto })),
  },
  video: {
    title: content.video.title,
    lead: content.video.lead,
    triggerPhrase: content.video.gatilho.frase,
    triggerCta: content.video.gatilho.cta,
  },
  about: { title: content.sobre.title, paragraphs: [...content.sobre.paragrafos] },
  faq: { items: content.faq.itens.map(({ q, a }) => ({ q, a })) },
};

/** Uma linha do banco: o conteúdo é JSON e só vale depois de passar no esquema. */
export type StoredText = { section: string; content: unknown };

export type ResolvedTexts = {
  texts: SectionTexts;
  /** Quais seções têm texto personalizado (as outras estão no padrão). */
  customized: TextSectionKey[];
};

/**
 * Padrão + o que está no banco. Linha que não passa no esquema de hoje
 * (o formato mudou depois que ela foi gravada) é IGNORADA: a seção volta
 * ao padrão em vez de derrubar a página.
 */
export function resolveTexts(rows: StoredText[]): ResolvedTexts {
  const texts: Record<string, unknown> = { ...DEFAULT_TEXTS };
  const customized: TextSectionKey[] = [];
  for (const key of TEXT_SECTION_KEYS) {
    const row = rows.find((r) => r.section === key);
    if (!row) continue;
    const parsed = textSchemas[key].safeParse(row.content);
    if (!parsed.success) continue;
    texts[key] = parsed.data;
    customized.push(key);
  }
  return { texts: texts as SectionTexts, customized };
}

const entry = <K extends TextSectionKey>(key: K) =>
  z.object({ section: z.literal(key), content: textSchemas[key] });

/** O conteúdo INTEIRO da seção, validado pelo esquema dela. */
export const saveTextSchema = z.discriminatedUnion("section", [
  entry("hero"),
  entry("band"),
  entry("experience"),
  entry("testimonials"),
  entry("video"),
  entry("about"),
  entry("faq"),
]);
export type SaveTextInput = z.input<typeof saveTextSchema>;

export const resetTextSchema = z.object({ section: z.enum(TEXT_SECTION_KEYS) });

/**
 * A página inteira, na ordem em que as seções aparecem: quais têm fotos
 * (`pictures`), quais têm texto editável (`texts`), quais têm os dois.
 * É a ordem do painel em /sections.
 */
export const PAGE_LAYOUT: readonly { pictures?: SectionKey; texts?: TextSectionKey }[] = [
  { pictures: "hero", texts: "hero" },
  { texts: "band" },
  { texts: "experience" },
  { pictures: "portfolio" },
  { texts: "testimonials" },
  { pictures: "video", texts: "video" },
  { pictures: "about", texts: "about" },
  { texts: "faq" },
  { pictures: "closing" },
];
