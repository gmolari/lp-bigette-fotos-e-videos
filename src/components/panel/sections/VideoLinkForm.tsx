"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { panelContent } from "@/config/panel-content";
import { useAction } from "@/lib/action/hooks";
import { useActionForm } from "@/lib/form/useActionForm";
import { removeSectionVideo, saveSectionVideo } from "@/modules/sections/actions";
import type { Board } from "@/modules/sections/application/sections";
import {
  VIDEO_FORMATS,
  parseYouTubeUrl,
  setVideoSchema,
  youTubeThumbnail,
  youTubeWatchUrl,
  type SectionVideo,
} from "@/modules/sections/domain/video";
import { BOARD_QUERY_KEY } from "../pictures/keys";
import { ActionAlert } from "../ui/ActionAlert";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Select } from "../ui/Select";

const t = panelContent.sections.video;
const formatOptions = VIDEO_FORMATS.map((f) => ({ value: f, label: t.formats[f] }));

/**
 * O vídeo da seção, por LINK do YouTube. O servidor confere no oEmbed que
 * o vídeo existe e é público antes de gravar — link quebrado seria um
 * quadro preto na página.
 */
export function VideoLinkForm({ video }: { video: SectionVideo | undefined }) {
  const queryClient = useQueryClient();
  const onBoard = (board: Board) => queryClient.setQueryData([...BOARD_QUERY_KEY, undefined], board);

  const form = useActionForm(setVideoSchema, saveSectionVideo, {
    initialValues: {
      url: video ? youTubeWatchUrl(video.youtubeId) : "",
      format: video?.format ?? "landscape",
    },
    onSuccess: onBoard,
  });
  const remove = useAction(removeSectionVideo, {
    onSuccess: (board) => {
      onBoard(board);
      form.setValue("url", "");
    },
  });

  const url = form.field("url");

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-bg p-4">
      <h3 className="font-display text-lg text-cream">{t.title}</h3>

      {video ? (
        <div className="flex items-center gap-3">
          <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-bg-3">
            <Image src={youTubeThumbnail(video.youtubeId)} alt="" fill sizes="128px" className="object-cover" />
          </div>
          <div className="min-w-0 text-sm">
            <p className="text-muted">{t.current}</p>
            <p className="line-clamp-2 text-cream">{video.title}</p>
            <a
              href={youTubeWatchUrl(video.youtubeId)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-accent-2 underline-offset-4 hover:underline"
            >
              {t.open}
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">{t.none}</p>
      )}

      <form onSubmit={form.submit} noValidate className="flex flex-col gap-4">
        <ActionAlert error={form.error ?? remove.error} />
        <Alert tone="success" message={form.isSuccess ? t.saved : undefined} />

        <Field
          label={t.url}
          hint={t.urlHint}
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          {...url}
          onChange={(e) => {
            url.onChange(e);
            // Link de Shorts já sugere o formato vertical
            const parsed = parseYouTubeUrl(e.target.value);
            if (parsed?.suggested === "vertical") form.setValue("format", "vertical");
          }}
        />
        <Select label={t.format} options={formatOptions} {...form.field("format")} />

        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" loading={form.isSubmitting} loadingLabel={t.saving}>
            {t.save}
          </Button>
          {video && (
            <Button
              size="sm"
              variant="ghost"
              loading={remove.isPending}
              loadingLabel={t.removing}
              disabled={form.isSubmitting}
              onClick={() => remove.mutate(undefined)}
            >
              {t.remove}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
