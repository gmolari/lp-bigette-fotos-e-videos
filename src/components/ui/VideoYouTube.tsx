"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { VideoDaPagina } from "@/lib/portfolio-tipos";

/**
 * Vídeo do YouTube em FACHADA: até o clique, é só a capa com um botão de
 * play. O player de verdade só entra quando a pessoa pede.
 *
 * Duas razões, as duas do projeto:
 *  - peso: o iframe do YouTube baixa mais que a página inteira — mesmo
 *    motivo que tirou o embed do Instagram (docs/03-decisoes.md, D4);
 *  - cookie: D9 promete página sem banner de consentimento. Antes do
 *    clique não há requisição ao YouTube nenhuma (a capa passa pelo
 *    /_next/image, do nosso domínio), e depois dele o player é o
 *    youtube-nocookie.com.
 *
 * Proporção vem do vídeo: 16:9, ou 9:16 para Shorts/Reels.
 */
export function VideoYouTube({ video, rotulo }: { video: VideoDaPagina; rotulo: string }) {
  const [tocando, setTocando] = useState(false);
  const quadro = video.vertical
    ? "mx-auto aspect-[9/16] w-full max-w-[22rem]"
    : "aspect-video w-full";

  if (tocando) {
    return (
      <div className={`overflow-hidden rounded-[16px] bg-bg-2 ${quadro}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&playsinline=1`}
          title={video.titulo}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="size-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTocando(true)}
      aria-label={`${rotulo}: ${video.titulo}`}
      className={`group relative block overflow-hidden rounded-[16px] bg-bg-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-2 ${quadro}`}
    >
      <Image
        src={video.capa.src}
        alt={video.capa.alt}
        fill
        sizes={video.vertical ? "352px" : "(max-width:768px) 100vw, 50vw"}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      <span aria-hidden="true" className="absolute inset-0 bg-bg/25 transition-colors duration-300 group-hover:bg-bg/10" />
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-ink shadow-lg transition-[scale] duration-300 group-hover:scale-110"
      >
        <Play className="ml-1 size-7" fill="currentColor" />
      </span>
    </button>
  );
}
