import { Section, Eyebrow, Title, Lead } from "@/components/ui/Section";
import { Gatilho } from "@/components/ui/Gatilho";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { content } from "@/config/content";

export function Video() {
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
          <Placeholder
            label="Frame do vídeo ou reel em loop"
            ratio="aspect-[4/5]"
          />
        </Reveal>
      </div>
      <Gatilho {...c.gatilho} source="video" />
    </Section>
  );
}
