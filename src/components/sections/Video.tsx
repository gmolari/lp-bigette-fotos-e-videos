import Image from "next/image";
import { Section, Eyebrow, Title, Lead } from "@/components/ui/Section";
import { Gatilho } from "@/components/ui/Gatilho";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { VideoYouTube } from "@/components/ui/VideoYouTube";
import { content } from "@/config/content";
import type { FotoPortfolio, VideoDaPagina } from "@/lib/portfolio-tipos";

/**
 * O vídeo vem do painel (/sections → Vídeo): link do YouTube + capa.
 *   com link        → fachada com play (VideoYouTube)
 *   só capa         → a foto, parada
 *   nada            → espaço reservado
 */
export function Video({ video, capa }: { video: VideoDaPagina | null; capa: FotoPortfolio | null }) {
  const c = content.video;
  return (
    <Section id="video" alt>
      <div className="grid items-center gap-9 md:grid-cols-2 md:gap-14">
        <div>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <Title>{c.title}</Title>
          <Lead>{c.lead}</Lead>
        </div>
        <Reveal variante="foco" delay={120}>
          {video ? (
            <VideoYouTube video={video} rotulo={c.assistir} />
          ) : capa ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-bg-2">
              <Image src={capa.src} alt={capa.alt} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
            </div>
          ) : (
            <Placeholder label={c.reservado} ratio="aspect-[4/5]" />
          )}
        </Reveal>
      </div>
      <Gatilho {...c.gatilho} source="video" />
    </Section>
  );
}
