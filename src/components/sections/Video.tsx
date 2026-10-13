import Image from "next/image";
import { Section, Eyebrow, Title, Lead } from "@/components/ui/Section";
import { Gatilho } from "@/components/ui/Gatilho";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { VideoYouTube } from "@/components/ui/VideoYouTube";
import { content } from "@/config/content";
import type { FotoPortfolio, VideoDaPagina } from "@/lib/portfolio-tipos";
import type { SectionTexts } from "@/modules/sections/domain/texts";

/**
 * O vídeo vem do painel (/sections → Vídeo): link do YouTube + capa.
 *   com link        → fachada com play (VideoYouTube)
 *   só capa         → a foto, parada
 *   nada            → espaço reservado
 *
 * Título, texto de apoio e gatilho também vêm de lá (`textos`).
 */
export function Video({
  video,
  capa,
  textos,
}: {
  video: VideoDaPagina | null;
  capa: FotoPortfolio | null;
  textos: SectionTexts["video"];
}) {
  const c = content.video;
  return (
    <Section id="video" alt>
      <div className="grid items-center gap-9 md:grid-cols-2 md:gap-14">
        <div>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <Title>{textos.title}</Title>
          <Lead>{textos.lead}</Lead>
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
      <Gatilho frase={textos.triggerPhrase} cta={textos.triggerCta} source="video" />
    </Section>
  );
}
