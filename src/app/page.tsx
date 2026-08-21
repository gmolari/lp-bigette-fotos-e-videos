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

export default function Home() {
  return (
    <>
      <TopBar />
      <main id="conteudo" className="relative z-1">
        <Hero />
        <FaixaImpacto />
        <Experiencia />
        <Sala />
        <Depoimentos />
        <Video />
        <ComoFunciona />
        <Sobre />
        <Faq />
        <CtaFinal />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
