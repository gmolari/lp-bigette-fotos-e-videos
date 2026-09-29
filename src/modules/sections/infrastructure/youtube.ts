import "server-only";
import { z } from "zod";
import { UpstreamError } from "@/lib/action/result";
import type { VideoLookup } from "../domain/ports";
import { youTubeWatchUrl } from "../domain/video";

/**
 * oEmbed do YouTube: público, sem chave de API. Conferido em 29/09/2026:
 * vídeo que existe → 200 com `title`; id inexistente → 400. Privado ou
 * com incorporação desligada também responde 4xx — e em todos esses
 * casos o vídeo não tocaria na página, então é recusado igual.
 */
const ENDPOINT = "https://www.youtube.com/oembed";
const TIMEOUT_MS = 10_000;

const response = z.object({ title: z.string().min(1) });

export const youTubeLookup: VideoLookup = {
  async title(youtubeId) {
    const url = `${ENDPOINT}?format=json&url=${encodeURIComponent(youTubeWatchUrl(youtubeId))}`;
    let res: Response;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (e) {
      throw new UpstreamError("youtube", "oEmbed sem resposta", undefined, { cause: e });
    }

    if (res.status >= 400 && res.status < 500) return null;
    if (!res.ok) throw new UpstreamError("youtube", `oEmbed → HTTP ${res.status}`);

    const parsed = response.safeParse(await res.json().catch(() => null));
    if (!parsed.success) throw new UpstreamError("youtube", "oEmbed com resposta inesperada");
    return parsed.data.title;
  },
};
