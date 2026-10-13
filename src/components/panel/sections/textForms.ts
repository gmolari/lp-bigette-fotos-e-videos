import { panelContent } from "@/config/panel-content";
import { TEXT_LIMITS, type TextSectionKey } from "@/modules/sections/domain/texts";

/**
 * O desenho do formulário de cada seção: quais campos, em que ordem, com
 * que rótulo. Os nomes são os do esquema zod (`domain/texts.ts`) — é por
 * eles que o erro de validação acha o campo.
 */

const f = panelContent.sections.texts.fields;

type Input = { name: string; label: string; hint?: string; multiline?: boolean };

export type TextFieldSpec = Input & { kind: "text" };

export type ListFieldSpec = {
  kind: "list";
  name: string;
  itemLabel: (n: number) => string;
  /** Campos de cada item. `null` = o item é um texto só (parágrafos). */
  fields: Input[] | null;
  min: number;
  max: number;
  /** Rótulo do botão de incluir. Sem ele, a lista tem tamanho fixo. */
  add?: string;
  /** O primeiro item não sai do topo nem pode ser removido. */
  pinFirst?: string;
  note?: string;
};

export type FieldSpec = TextFieldSpec | ListFieldSpec;

export const TEXT_FORMS: Record<TextSectionKey, FieldSpec[]> = {
  hero: [
    { kind: "text", name: "eyebrow", label: f.hero.eyebrow, hint: f.hero.eyebrowHint },
    { kind: "text", name: "title", label: f.hero.title },
    { kind: "text", name: "lead", label: f.hero.lead, multiline: true },
    { kind: "text", name: "seal", label: f.hero.seal },
  ],
  band: [
    { kind: "text", name: "first", label: f.band.first },
    { kind: "text", name: "second", label: f.band.second },
  ],
  experience: [
    {
      kind: "list",
      name: "cards",
      itemLabel: f.experience.card,
      fields: [
        { name: "title", label: f.experience.title },
        { name: "text", label: f.experience.text, multiline: true },
      ],
      ...TEXT_LIMITS.cards,
    },
  ],
  testimonials: [
    {
      kind: "list",
      name: "items",
      itemLabel: f.testimonials.item,
      fields: [
        { name: "quote", label: f.testimonials.quote },
        { name: "context", label: f.testimonials.context, hint: f.testimonials.contextHint },
      ],
      ...TEXT_LIMITS.testimonials,
      add: f.testimonials.add,
      note: f.testimonials.note,
    },
  ],
  video: [
    { kind: "text", name: "title", label: f.video.title },
    { kind: "text", name: "lead", label: f.video.lead, multiline: true },
    { kind: "text", name: "triggerPhrase", label: f.video.triggerPhrase },
    { kind: "text", name: "triggerCta", label: f.video.triggerCta },
  ],
  about: [
    { kind: "text", name: "title", label: f.about.title },
    {
      kind: "list",
      name: "paragraphs",
      itemLabel: f.about.item,
      fields: null,
      ...TEXT_LIMITS.paragraphs,
      add: f.about.add,
    },
  ],
  faq: [
    {
      kind: "list",
      name: "items",
      itemLabel: f.faq.item,
      fields: [
        { name: "q", label: f.faq.q },
        { name: "a", label: f.faq.a, multiline: true },
      ],
      ...TEXT_LIMITS.faq,
      add: f.faq.add,
      pinFirst: f.faq.pinned,
      note: f.faq.note,
    },
  ],
};
