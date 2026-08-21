"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Eyebrow, Title } from "@/components/ui/Section";
import { Gatilho } from "@/components/ui/Gatilho";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Reveal } from "@/components/ui/Reveal";
import { Palco3D } from "@/components/three/Palco3D";
import { content } from "@/config/content";
import {
  MS_ENTRADA_PARADA,
  MS_DERIVA_PARADA,
  MS_SAIDA_PARADA,
  aguentaCena3D,
} from "@/lib/motion";

const semInscricao = () => () => {};

/**
 * O VARAL — a seção presa na tela.
 *
 * Enquanto ela está presa, rolar não desce a página: move a câmera pelo
 * varal e troca o texto. É a diferença entre "a página passou" e "a cena
 * andou". Cada parada mostra UMA frase e UM texto curto — a versão
 * anterior era uma grade de sete miniaturas iguais disputando a mesma
 * atenção, e não dava para olhar nenhuma.
 *
 * Em aparelho sem 3D, cai numa grade normal com as mesmas fotos. O
 * conteúdo é o mesmo nos dois caminhos; o que muda é como se chega nele.
 */
export function Sala() {
  const c = content.sala;
  const trilho = useRef<HTMLDivElement>(null);
  const barraRef = useRef<HTMLOListElement>(null);
  const [estacao, setEstacao] = useState(0);

  /* A barra do percurso enche de verdade, em vez de só acender de uma
     vez. O valor vem por quadro, então é escrito direto numa custom
     property — passar por estado seria um render a cada quadro. */
  const aoProgredir = useCallback((p: number) => {
    barraRef.current?.style.setProperty("--p", String(p));
  }, []);

  // useSyncExternalStore em vez de useState+useEffect: no servidor
  // devolve `false` e renderiza a grade, que é o caminho que sempre
  // funciona; no cliente, decide de verdade.
  const tem3D = useSyncExternalStore(semInscricao, aguentaCena3D, () => false);

  if (!tem3D) {
    return (
      <section id="portfolio" className="relative z-1 bg-bg py-20 sm:py-[104px]">
        <div className="container-lp">
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <Title className="max-w-[24ch]">{c.titulo}</Title>
          {/* ── A GRADE SEM 3D ──────────────────────────────────
              Dois mecanismos, um por largura, porque a aritmética muda.

              As paisagens ocupam o dobro das retratos. Com 3 paisagens
              e 4 retratos são 3×2 + 4×1 = **10 unidades**.

              • 2 COLUNAS → 10 ÷ 2 fecha exato. Grade de verdade, e a
                paisagem ganha a largura inteira. É o melhor arranjo
                para celular, que é de onde vem a maior parte do
                tráfego: a foto de abertura chega com 346px em vez de
                167px.

              • 3 COLUNAS → 10 ÷ 3 NÃO fecha. Antes as duas últimas
                paisagens ficavam sozinhas ocupando 2 de 3 colunas, e
                sobravam dois buracos de coluna inteira — ~700×800px de
                vazio, com a borda direita rasgada até o fim da seção.
                Nenhum arranjo de `col-span` conserta isso; é o resto
                da divisão. Então em `lg` a grade vira MOSAICO
                (`columns`), onde não existe célula vazia por
                construção: a sobra vira diferença de altura entre
                colunas, que é o desenho, não defeito.

              O `display` é que troca: `grid` embaixo, `block +
              columns-3` no `lg`. As classes do outro modo ficam
              inertes sozinhas — `col-span-2` não faz nada em multicol,
              e `mb` só entra no `lg` porque em grade quem separa é o
              `gap`.

              ⚠️ Se o número de fotos mudar, confira as DUAS larguras.
              A grade de 2 colunas só fecha enquanto o número de
              retratos for par. */}
          <div className="mt-12 grid grid-cols-2 gap-3.5 [grid-auto-flow:dense] lg:block lg:columns-3">
            {c.fotos.map((foto, i) => {
              const deitada = foto.formato === "paisagem";
              return (
                <Reveal
                  key={foto.src}
                  variante="foco"
                  delay={i * 70}
                  className={`lg:mb-3.5 lg:break-inside-avoid ${
                    deitada ? "col-span-2" : ""
                  }`}
                >
                  <div
                    className={`relative overflow-hidden rounded-[16px] bg-bg-2 ${
                      deitada ? "aspect-[3/2]" : "aspect-[3/4]"
                    }`}
                  >
                    <Image
                      src={foto.src}
                      alt={foto.alt}
                      fill
                      /* A paisagem ocupa a largura toda até `lg`; a
                         retrato, metade. Acima disso as duas viram
                         coluna de ~360px. */
                      sizes={
                        deitada
                          ? "(max-width:1024px) 100vw, 360px"
                          : "(max-width:1024px) 50vw, 360px"
                      }
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Gatilho {...c.gatilho} source="portfolio" />
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="relative z-1 bg-bg">
      {/* O trilho é alto; o miolo é que fica preso. Uma tela de altura
          por parada, mais uma de folga para entrar e sair. */}
      <div ref={trilho} className="relative h-[460vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <Palco3D
            tipo="varal"
            refTrilho={trilho}
            aoTrocarEstacao={setEstacao}
            aoProgredir={aoProgredir}
          />

          {/* Véu do lado do texto, para o contraste não depender da
              cena. A direção acompanha o enquadramento: no celular o
              texto mora EMBAIXO, então o véu sobe de baixo; no desktop
              mora à ESQUERDA, e o véu vem da esquerda. Um véu
              horizontal num celular deixaria o texto em cima do print,
              que foi exatamente o que apareceu no primeiro teste. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_26%,rgba(10,9,17,.55)_42%,rgba(10,9,17,.92)_58%,var(--color-bg)_74%)] lg:bg-[linear-gradient(90deg,var(--color-bg)_0%,var(--color-bg)_22%,rgba(10,9,17,.93)_38%,rgba(10,9,17,.6)_52%,transparent_70%)]"
          />

          {/* Celular: texto ancorado embaixo, sob o véu vertical.
              Desktop: centralizado na coluna da esquerda. */}
          <div className="container-lp relative flex h-full flex-col justify-end pb-14 lg:justify-center lg:pb-0">
            <div className="max-w-[30rem]">
              <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold tracking-[0.24em] text-ouro uppercase">
                <span aria-hidden="true" className="h-px w-9 bg-ouro/70" />
                {c.eyebrow}
              </p>

              {/* ── A TROCA DE TEXTO ────────────────────────────
                  As quatro paradas ficam empilhadas no mesmo lugar e
                  só a ativa aparece — troca de conteúdo sem a página
                  andar embaixo do texto.

                  A parada REVELA como cópia no banho: chega desfocada
                  e deslocada, e resolve. É o mesmo gesto do hero (a
                  foto entra fora de foco e encontra o assunto) e da
                  variante `foco` do <Reveal>. Numa página de fotógrafa
                  vale mais que um esmaecimento genérico — e resolve um
                  problema concreto: durante a troca os dois blocos
                  chegam a coexistir, e o olho trava no NÍTIDO. Sem o
                  desfoque eles disputam, e dois textos legíveis
                  empilhados é exatamente o que se lê como tremida.

                  As que já passaram estacionam ABAIXO; as que ainda
                  não chegaram esperam ACIMA. Avançar move as duas para
                  baixo ao mesmo tempo — a que sai continua descendo, a
                  que entra desce para o lugar. Voltar espelha sozinho.

                  ⛔ POR QUE ISTO É `style` E NÃO CLASSE DO TAILWIND
                  Aqui já houve um bug que sobreviveu a duas rodadas de
                  conserto: a classe era `transition-[opacity,transform]`
                  com `translate-y-9`. No Tailwind v4 `translate-y-*`
                  escreve a propriedade `translate`, NÃO `transform` —
                  então `transform` era `none` e `translate` ficava fora
                  da lista de transição. Resultado: o texto TELEPORTAVA
                  36px em opacidade cheia e só depois esmaecia. O
                  mecanismo descrito acima nunca rodou.
                  Medido: `opacidade 1.00 · translate 0px 36px` no mesmo
                  quadro. Ver docs/09-movimento-3d.md.

                  Escrito como `style`, a propriedade animada e a
                  propriedade declarada são forçosamente a mesma coisa,
                  e não há utilitário no meio para divergir. */}
              {/* Empilhamento em GRADE, não em `absolute`.
                  Filho em `absolute` não soma altura, então a pilha
                  dependia de um `min-h` chutado — e a parada 4, que tem
                  o botão a mais, estourava esse valor e ia parar por
                  cima da barra de percurso no celular.
                  Com todos os filhos na MESMA célula (`grid-area:1/1`),
                  a linha cresce sozinha até a parada mais alta. Sem
                  número mágico, e sem como estourar quando um texto
                  crescer. */}
              <div className="grid">
                {c.estacoes.map((e, i) => {
                  const ativa = estacao === i;
                  const passou = i < estacao;
                  return (
                    <div
                      key={e.rotulo}
                      aria-hidden={!ativa}
                      /* `inert` porque `pointer-events-none` não tira do
                         Tab: sem ele, o botão da última parada continua
                         recebendo foco invisível. */
                      inert={!ativa}
                      className="[grid-area:1/1] self-start motion-reduce:transition-none"
                      style={{
                        opacity: ativa ? 1 : 0,
                        translate: ativa ? "0 0" : passou ? "0 32px" : "0 -32px",
                        filter: ativa ? "blur(0px)" : "blur(7px)",
                        transitionProperty: "opacity, filter, translate",
                        /* Na SAÍDA o deslocamento tem tempo e curva
                           próprios. Com a mesma curva das entradas
                           (`--ease-out`, que arranca forte de
                           propósito) o texto que sai dava um pinote de
                           22px num único quadro ainda com 31% de
                           opacidade — medido. Lido como solavanco.

                           Agora ele dissolve PARADO — some em 200ms
                           tendo andado ~4px — e só depois deriva para
                           fora, já invisível. Os 360ms do deslocamento
                           terminam sem plateia; é o esmaecimento que
                           marca o tempo. */
                        transitionDuration: ativa
                          ? `${MS_ENTRADA_PARADA}ms, ${MS_ENTRADA_PARADA}ms, ${MS_ENTRADA_PARADA}ms`
                          : `${MS_SAIDA_PARADA}ms, ${MS_SAIDA_PARADA}ms, ${MS_DERIVA_PARADA}ms`,
                        transitionTimingFunction: ativa
                          ? "var(--ease-out), var(--ease-out), var(--ease-out)"
                          : "var(--ease-out), var(--ease-out), var(--ease-inout)",
                      }}
                    >
                      <p className="mb-4 text-[12px] tracking-[0.2em] text-muted uppercase">
                        {e.rotulo}
                      </p>
                      <h2 className="mb-5 font-display text-[clamp(30px,4.4vw,46px)] leading-[1.06] tracking-[-0.015em]">
                        {e.frase}
                      </h2>
                      <p className="max-w-[42ch] text-[17px] leading-relaxed text-muted">
                        {e.texto}
                      </p>
                      {/* O convite mora na última parada, e só nela: quem
                          chegou aqui percorreu o varal inteiro. Antes ele
                          ficava num bloco solto depois da seção presa, o
                          que abria um vão morto quando ela soltava. */}
                      {i === c.estacoes.length - 1 && (
                        <div className="mt-8">
                          <WhatsAppButton source="portfolio" size="lg" seta>
                            {c.gatilho.cta}
                          </WhatsAppButton>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* marcador de percurso: quantas paradas faltam */}
              <ol
                ref={barraRef}
                className="mt-7 flex gap-2 lg:mt-2"
                aria-label="Progresso do percurso"
              >
                {c.estacoes.map((e, i) => (
                  <li
                    key={e.rotulo}
                    className="h-0.5 w-12 overflow-hidden rounded-full bg-line-forte"
                  >
                    {/* Cada barra é um quarto do percurso e enche
                        continuamente dentro do seu trecho. */}
                    <span
                      aria-hidden="true"
                      className="block h-full origin-left rounded-full bg-accent"
                      style={{
                        transform: `scaleX(clamp(0, calc(var(--p, 0) * 4 - ${i}), 1))`,
                      }}
                    />
                    <span className="sr-only">
                      {e.rotulo}
                      {i === estacao ? " (atual)" : ""}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
