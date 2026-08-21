import { WhatsAppButton } from "./WhatsAppButton";
import { Reveal } from "./Reveal";

type Props = {
  frase: string;
  cta: string;
  /** Nome da seção, para rastrear qual gatilho converte mais */
  source: string;
};

/**
 * O bloco que fecha CADA seção: frase de efeito + botão de WhatsApp.
 * É a peça central da estratégia da página — o visitante nunca fica
 * a mais de uma tela de distância de um caminho para a conversa.
 */
export function Gatilho({ frase, cta, source }: Props) {
  return (
    <Reveal variante="scale" className="mt-12">
      {/* Fundo chapado e um fio de contorno. O gradiente anterior era
          decoração, não informação — e onze deles na mesma página
          davam à peça um aspecto de template. */}
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-[20px] border border-accent/25 bg-accent/[0.06] px-7 py-6">
        <p className="max-w-[46ch] font-display text-xl leading-snug text-lilas-200 italic sm:text-2xl">
          {frase}
        </p>
        <WhatsAppButton source={source} seta className="max-sm:w-full">
          {cta}
        </WhatsAppButton>
      </div>
    </Reveal>
  );
}
