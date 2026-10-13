import { TopBar } from "@/components/sections/TopBar";
import { Hero } from "@/components/sections/Hero";
import { FaixaImpacto } from "@/components/sections/FaixaImpacto";
import { Experiencia } from "@/components/sections/Experiencia";
import { Sala } from "@/components/sections/Sala";
import { Depoimentos } from "@/components/sections/Depoimentos";
import { Video } from "@/components/sections/Video";
import { ComoFunciona } from "@/components/sections/ComoFunciona";
import { Sobre } from "@/components/sections/Sobre";
import { Faq } from "@/components/sections/Faq";
import { CtaFinal } from "@/components/sections/CtaFinal";
import { Footer } from "@/components/sections/Footer";
import { WhatsAppFloat } from "@/components/sections/WhatsAppFloat";
import { faqSchema } from "@/lib/jsonld";
import { getPageTexts } from "@/lib/page-texts";
import { fotosDasSecoes } from "@/lib/portfolio";

/**
 * Rede de segurança do cache das fotos. O normal é a action do painel
 * invalidar a tag na hora; isto cobre o build que caiu nas fotos de
 * reserva porque o banco estava fora do ar — sem ele, a página ficaria
 * presa nelas até o próximo deploy. No máximo uma consulta por hora, e
 * só se alguém visitar.
 */
export const revalidate = 3600;

export default async function Home() {
  // Lidas no servidor, com cache (ver src/lib/portfolio.ts): as URLs já
  // saem no HTML e a página continua estática. Cada seção tem as suas
  // fotos, escolhidas em /sections no painel.
  // Os textos seguem o mesmo caminho: padrão em content.ts, personalizado
  // no painel. Em consulta separada — uma falhar não derruba a outra.
  const [fotos, textos] = await Promise.all([fotosDasSecoes(), getPageTexts()]);

  return (
    <>
      {/* FAQPage com as MESMAS perguntas que a seção mostra. `<` escapado:
          o texto vem do painel, e um "</script>" ali fecharia a tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(textos.faq.items)).replace(/</g, "\\u003c") }}
      />
      <TopBar />
      <main id="conteudo" className="relative z-1">
        <Hero foto={fotos.hero} textos={textos.hero} />
        <FaixaImpacto textos={textos.band} />
        <Experiencia textos={textos.experience} />
        <Sala fotos={fotos.portfolio} />
        <Depoimentos textos={textos.testimonials} />
        <Video video={fotos.video} capa={fotos.capaSemVideo} textos={textos.video} />
        <ComoFunciona />
        <Sobre foto={fotos.about} textos={textos.about} />
        <Faq textos={textos.faq} />
        <CtaFinal fotos={fotos.closing} />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
