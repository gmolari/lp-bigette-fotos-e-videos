import { z } from "zod";
import { panelContent } from "@/config/panel-content";

/**
 * Vídeo por LINK do YouTube — nada é enviado nem hospedado aqui.
 * Compartilhado cliente/servidor: o painel reconhece o link na hora.
 *
 * Spec: .claude/specs/007-media-inventory.md
 */

const v = panelContent.sections.video.validation;

/** 16:9 (vídeo comum) ou 9:16 (Shorts/Reels). Decide o quadro na página. */
export const VIDEO_FORMATS = ["landscape", "vertical"] as const;
export type VideoFormat = (typeof VIDEO_FORMATS)[number];

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"]);

/**
 * Qualquer forma de link que se cola do YouTube → id de 11 caracteres.
 *   youtube.com/watch?v=ID · youtu.be/ID · youtube.com/shorts/ID
 *   youtube.com/embed/ID · youtube.com/live/ID (com ou sem parâmetros)
 * `shorts` já sugere o formato vertical.
 */
export function parseYouTubeUrl(input: string): { id: string; suggested: VideoFormat } | null {
  let url: URL;
  try {
    url = new URL(input.trim().startsWith("http") ? input.trim() : `https://${input.trim()}`);
  } catch {
    return null;
  }
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;

  const parts = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;
  let suggested: VideoFormat = "landscape";

  if (url.hostname === "youtu.be") id = parts[0] ?? null;
  else if (parts[0] === "watch") id = url.searchParams.get("v");
  else if (["shorts", "embed", "live", "v"].includes(parts[0])) {
    id = parts[1] ?? null;
    if (parts[0] === "shorts") suggested = "vertical";
  }

  return id && YOUTUBE_ID.test(id) ? { id, suggested } : null;
}

export const setVideoSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, { error: v.urlRequired })
    .refine((s) => parseYouTubeUrl(s) !== null, { error: v.urlInvalid }),
  format: z.enum(VIDEO_FORMATS, { error: v.format }),
});

/** O que a página e o painel recebem. */
export type SectionVideo = {
  youtubeId: string;
  format: VideoFormat;
  /** Título do YouTube (via oEmbed). Vai no `title` do iframe — acessibilidade. */
  title: string;
};

export const youTubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const youTubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
