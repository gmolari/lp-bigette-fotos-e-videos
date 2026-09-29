import { z } from "zod";
import { panelContent } from "@/config/panel-content";

/**
 * Regras de foto do portfólio. Compartilhado cliente/servidor: o
 * navegador recusa na hora, sem subir 4 MB para ouvir "não"; a action
 * confere de novo porque o cliente não é confiável.
 *
 * Spec: .claude/specs/005-portfolio-pictures.md
 */

const v = panelContent.pictures.validation;

/**
 * 4 MB. Dois limites empilhados apontam para cá:
 *  - peso: o original fica guardado na cota grátis do Blob (1 GB);
 *  - Vercel: corpo de função serverless para em 4,5 MB, e o upload
 *    passa inteiro por uma server action.
 */
export const MAX_PICTURE_BYTES = 4 * 1024 * 1024;

/**
 * Piso de qualidade: o lado MAIOR precisa de 1200 px. A paisagem de
 * abertura ocupa a largura inteira do celular (~390 CSS px × 3 de
 * densidade ≈ 1170 px físicos); menos que isso já chega borrada.
 */
export const MIN_LONG_SIDE_PX = 1200;

export const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export type AcceptedMime = (typeof ACCEPTED_MIME)[number];

export const ALT_MIN = 8;
export const ALT_MAX = 160;

/**
 * O store do Blob é PRIVADO: o arquivo não tem URL aberta. Quem lê é a
 * rota `/media/[...path]`, que o otimizador do Next consulta uma vez por
 * largura. Este é o formato da chave que ela aceita — nada fora de
 * `portfolio/<uuid>.<ext>` é servido.
 */
export const STORAGE_KEY_PATTERN = /^portfolio\/[0-9a-f-]{36}\.(jpg|png|webp)$/;
/** Chave do armazenamento → URL do site (é a que vai para o banco e o `<Image>`). */
export const mediaUrl = (key: string) => `/media/${key}`;

/** Paisagem ocupa duas colunas na grade e vira papel deitado no varal. */
export type Orientation = "landscape" | "portrait";
export const orientationOf = (width: number, height: number): Orientation =>
  width > height ? "landscape" : "portrait";

export const altField = z
  .string()
  .trim()
  .min(ALT_MIN, { error: v.altTooShort })
  .max(ALT_MAX, { error: v.altTooLong });

export const pictureFileField = z
  .file({ error: v.fileRequired })
  .max(MAX_PICTURE_BYTES, { error: v.fileTooLarge })
  .mime([...ACCEPTED_MIME], { error: v.fileType });

export const uploadPictureSchema = z.object({
  file: pictureFileField,
  alt: altField,
});

export const pictureIdSchema = z.object({ id: z.uuid() });

/**
 * O que sai do servidor. Sem a chave do armazenamento, sem quem subiu.
 * Sem posição: a ordem não é do banco de fotos, é de cada seção (spec 006).
 */
export type Picture = {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  sizeBytes: number;
  orientation: Orientation;
};
