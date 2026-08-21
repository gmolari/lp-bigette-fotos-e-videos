# Movimento e 3D

> Regra que governa tudo aqui: **nada anima sem antes perguntar se a pessoa
> pediu movimento reduzido, e nada em 3D é baixado sem antes perguntar se o
> aparelho aguenta.** Esta página é link de bio — a maior parte do tráfego é
> celular, e lá ela precisa abrir, não impressionar.

## As três camadas

| Camada | Onde | Custo |
|---|---|---|
| Revelação no scroll | `src/components/ui/Reveal.tsx` | IntersectionObserver, zero por quadro |
| Parallax do hero | `src/components/ui/Parallax.tsx` | um `rAF` por evento de scroll |
| Cenas 3D | `src/components/three/` | chunk separado, só em desktop capaz |

## Revelação (`<Reveal>`)

Marca o elemento com `data-reveal="<variante>"`; quando entra na tela, vira
`data-shown="true"`. As variantes e curvas moram em `globals.css`.

Variantes: `up` · `down` · `left` · `right` · `scale` · `foco` (desfoca e
resolve, como lente focando) · `cortina` (entrada mais longa, para títulos).

Escalonamento de lista é `delay={i * 90}`.

### ⛔ Nunca use `clip-path` no estado revelado

Já quebrou a página inteira uma vez. `clip-path: inset()` com **valor
negativo** é descartado pelo Chrome; sem o estado revelado válido, o
elemento fica com o `inset(0 0 105% 0)` do estado inicial **para sempre**.

Como todo `<Title>` usava a variante `cortina`, **nenhum título da página
aparecia** — e o sintoma que chegou foi "a segunda seção é uma faixa lilás
vazia", não "os títulos sumiram". O bug estava em toda parte e parecia local.

O sistema hoje só anima `opacity`, `transform` e `filter`.

### Sem JavaScript nada fica escondido

`layout.tsx` tem um `<noscript>` que força todo `[data-reveal]` a visível.
Sem isso, JS desligado = página em branco.

## As cenas 3D

Duas, e as duas vivem **dentro de uma seção**. A versão anterior tinha uma
cena permanente atrás da página inteira: disputava atenção com todo o resto
e dava ar de demonstração de biblioteca.

### 1. O varal — `#portfolio`

Prints pendurados num arame numa sala escura, secando. A seção fica **presa
na tela** enquanto a câmera percorre quatro paradas; rolar não desce a
página, move a câmera e troca o texto.

Substituiu a grade de sete miniaturas iguais. Sete quadros idênticos
disputando a mesma atenção não deixavam olhar nenhum; agora cada parada tem
**uma** frase, **um** texto curto e **uma** foto. O CTA aparece só na quarta.

Detalhes que fazem a leitura de câmera de verdade e não de "objeto girando":

- **distância focal muda entre as paradas** (`fov` interpolado)
- **ponto principal descentrado** (`camera.setViewOffset`) para o assunto
  ficar à direita e o texto ter coluna limpa à esquerda — é o equivalente
  ao deslocamento de uma tilt-shift, e mantém as verticais retas
- respiração lenta na posição, para a câmera nunca ficar morta parada

### 2. As polaroides — `#contato`

Anel lento de fotos reveladas atrás do fecho. Ambiente, não dirigido pelo
scroll: só existe e respira.

### O portão — `aguentaCena3D()`

Em `src/lib/motion.ts`. Reprova se: movimento reduzido, sem WebGL,
economia de dados ligada, menos de 4 GB de RAM ou menos de 4 núcleos.
O resultado é memorizado.

### 🔄 O portão de 900px CAIU — a cena roda no celular

Até 21/08/2026 havia também `innerWidth < 900`, e o argumento era bom:
a maior parte do tráfego é celular, e lá a página precisa abrir.

O argumento estava errado pelo mesmo motivo que o tornava convincente.
A cena É o argumento visual da página. Cortá-la exatamente onde está
quase todo mundo significava que quase ninguém via a página — via a
versão pobre dela. O portão protegia a métrica e entregava o produto
errado.

Medido antes de decidir, com CPU estrangulada em 4× e renderização por
software (`swiftshader`), que é **pior que celular real**, já que o
celular tem GPU e ali é tudo CPU:

```
mediana 16,7 ms (60 fps) · p95 33,4 ms · pior quadro 49,9 ms
quadros acima de 50 ms: 0 de 201
```

Não é um aparelho sofrendo. E as checagens que sobraram continuam
barrando quem realmente não aguenta — menos de 4 GB de RAM, menos de 4
núcleos, economia de dados ligada — além de quem pediu menos
movimento, que cai na grade 2D em qualquer largura.

**O que a cena custa: 130 KB gzip** (527 KB bruto).

### O chunk só desce quando a seção se aproxima

Enquanto era só desktop, importar no `mount` não pesava. Com celular
incluído, isso põe 130 KB para disputar banda com a foto do hero — que
é o que a pessoa está esperando ver.

`Palco3D` tem agora DOIS observadores: um de aproximação
(`rootMargin: 150%`), que só dispara o `import()`, e o de sempre
(`10%`), criado lá dentro, que liga e desliga o laço de render.

**Verificado contra o build de PRODUÇÃO** — em `npm run dev` o
Turbopack não faz o mesmo code-splitting e o teste dá falso positivo:

```
topo da página      → chunk 3D baixado? não
~1,4 tela antes     → baixado (528 KB)
chegando na seção   → canvas prontos, cena montada
```

> ⚠️ Ao medir isto de novo, **rode contra `npm run start`, não contra
> `npm run dev`** — e detecte o chunk pelo TAMANHO, não pelo nome: em
> produção ele é um hash, sem "three" nem "cenas" no nome. As duas
> armadilhas deram resultado errado na primeira tentativa.

### Enquadramento em retrato

Em tela estreita não existe coluna de texto AO LADO — existe uma
EMBAIXO. Três coisas mudam junto, e nenhuma sozinha resolve:

| | tela larga | tela estreita |
|---|---|---|
| ponto principal | assunto vai para a DIREITA (`DESLOCA_X`) | assunto SOBE (`DESLOCA_Y`) |
| câmera | posição das paradas | recua `RECUO_ESTREITA` |
| véu | gradiente da esquerda | gradiente de baixo |
| texto | centralizado na coluna | ancorado no rodapé |

**Por que recuar em vez de abrir o `fov`:** o `fov` do three.js é
VERTICAL. Numa tela 9:19 o campo horizontal encolhe tanto que sobra um
print só, perdido no vazio — foi literalmente o primeiro teste em
celular. Recuperar o campo horizontal do desktop abrindo o fov pediria
uns 100°, e a essa altura as bordas entortam. Esta cena inteira existe
para parecer câmera de verdade; trocar isso por grande-angular de porta
de peixe perde o ponto.

**E o véu precisa girar junto.** No primeiro teste ele continuou
horizontal, e o resultado foi o texto atravessando o rosto do print,
ilegível. Véu é uma decisão de enquadramento, não um detalhe de estilo:
ele escurece o lado onde o texto mora, e no celular esse lado é outro.

Conferido de olho nas 4 paradas e no `#contato`, em Pixel 7 e
iPhone 13. As paradas percorrem `0 → 1 → 2 → 3` no celular.

Sem 3D — movimento reduzido, aparelho fraco, sem WebGL — `#portfolio`
vira uma grade com as mesmas fotos.

### A grade sem 3D usa DOIS mecanismos, um por largura

Porque a aritmética muda. Paisagem ocupa o dobro de retrato: com 3
paisagens e 4 retratos são **10 unidades**.

**2 colunas — grade.** 10 ÷ 2 fecha exato, e a paisagem fica com a
largura inteira. É o melhor arranjo para celular, de onde vem a maior
parte do tráfego: a foto de abertura chega com 346px em vez de 167px.

**3 colunas — mosaico (`columns`).** 10 ÷ 3 não fecha. A versão
anterior deixava as duas últimas paisagens sozinhas ocupando 2 de 3
colunas, com **dois buracos de coluna inteira** — ~700×800px de vazio e
a borda direita rasgada até o fim da seção. Nenhum arranjo de
`col-span` conserta: é o resto da divisão. Em multicol não existe
célula vazia por construção; a sobra vira diferença de altura entre
colunas.

> ⚠️ **A diferença de altura de ~226px entre colunas é o mínimo
> possível, não um defeito.** Com 4 retratos em 3 colunas, alguma
> coluna leva dois (452+452 = 904px), então o máximo é ≥ 904; a melhor
> partição de 2486px é {904, 904, 678}. Não tente "consertar"
> reintroduzindo `col-span` — foi de lá que vieram os buracos.

Testado um mosaico puro em todas as larguras antes disso: no celular a
foto de abertura caía de 346px para 167px. Corrigia o desktop
estragando o aparelho que mais importa.

⚠️ **Se o número de fotos mudar, confira as DUAS larguras.** A grade de
2 colunas só fecha enquanto o número de retratos for par.

O laço de render também só roda enquanto a seção está na tela.

### ⚠️ `useSyncExternalStore` e o efeito que não roda

`Palco3D` decide se existe com `useSyncExternalStore`, que devolve `false`
na hidratação e `true` logo depois. **`tem3D` precisa estar nas dependências
do `useEffect`** — sem isso o efeito roda uma vez só, quando o `<canvas>`
ainda nem está no DOM, e a cena nunca é criada. Aconteceu; as polaroides
sumiram sem erro nenhum no console.

## As fotos reais entram sozinhas

Basta pôr `01.jpg` … `07.jpg` em `public/portfolio/`. As duas cenas passam a
usá-las — nos prints do varal e nas polaroides do fecho — sem tocar em código.

Como funciona: a cena nasce com as texturas desenhadas em `<canvas>` e
aparece **na hora**; em paralelo, `aplicarFotosReais()` verifica se as fotos
existem e faz o upgrade. Ninguém espera download para ver a página se mexer.

A verificação é **uma** requisição `HEAD` em `01.jpg`, memorizada. Enquanto as
fotos não chegam, isso deixa **um** 404 no console — sem a sonda seriam 19
tentativas falhando a cada carregamento, e console cheio de erro inofensivo é
a melhor forma de esconder o erro que importa.

A margem de papel continua desenhada; só o miolo vira a foto, com recorte
`cover` centralizado. O grão de filme é aplicado **só** no procedural: numa
foto de verdade ele sujaria a imagem.

O campo `formato` de cada foto em `content.sala.fotos` faz três coisas ao
mesmo tempo: define a proporção na grade 2D, quais ocupam duas colunas, e o
**formato do papel pendurado no varal 3D**. Um varal só de retrato fica com
cara de catálogo — misturar em pé e deitada é o que faz parecer trabalho.

Prints deitados são ~30% mais largos, então avançavam sobre a coluna de
texto; por isso `DESLOCA_X` subiu de 0,20 para 0,27.

## O hero — profundidade sem 3D

Quatro camadas em velocidades diferentes. É o princípio do fundo de teatro:
o que está longe se move menos.

| Camada | Scroll | Ponteiro |
|---|---|---|
| foto | ×0,34 (a mais lenta) + deriva própria | ±16 px |
| véu | ×0,16 | — |
| texto | acompanha a página | ∓7 px (**sentido contrário**) |
| seta | ancorada | — |

O que o olho lê como profundidade é a **separação** entre as camadas, não o
deslocamento em si — por isso foto e texto vão em sentidos opostos.

A entrada é um **focus pull**: a foto chega desfocada e resolve. Numa página
de fotógrafa, o primeiro gesto ser o de uma lente encontrando o assunto vale
mais que qualquer transição genérica. É CSS puro (`@keyframes foco-hero`),
não espera JavaScript e não passa por estado.

São três `<div>` aninhadas em volta da foto, de propósito: cada uma carrega
**um** transform. Empilhar paralaxe, focus pull e deriva no mesmo elemento
faria os três brigarem pela mesma propriedade.

Medido: ponteiro à esquerda → foto −12,6 px e texto +5,5 px; após rolar
420 px → foto 142,8 px e véu 67,2 px. Com `prefers-reduced-motion`, nenhuma
custom property é escrita.

## ⚠️ A troca de parada precisa de zona morta

O texto de cada parada é trocado pelo callback `aoTrocarEstacao`. Decidir a
parada com `Math.round(escala)` **pisca**: quando o scroll para perto de uma
fronteira, o valor amortecido oscila em torno dela e a parada troca ida e
volta a cada quadro — um render do React por quadro.

Medido, sacudindo o scroll ±3 px exatamente sobre a fronteira:

| | trocas de parada |
|---|---|
| `Math.round(escala)` | **20** |
| com zona morta de ±0,62 | **0** |

## A transição das paradas: tudo desce junto

A zona morta matou as trocas que voltavam atrás, mas a tremida continuava —
por outro motivo. Medindo com **scroll de roda de verdade** (não com saltos
discretos, que escondem o problema), as trocas chegam a cada ~600 ms. A
transição de então levava 730 ms (170 de espera + 560 de entrada): o bloco
novo era substituído antes de terminar de entrar, e a espera era um vão em
que nada aparecia.

A solução não foi só encurtar. As paradas que **já passaram** ficam
estacionadas ABAIXO; as que **ainda não chegaram**, ACIMA:

```
i <  estacao   →  translate-y-9    (já desceu e saiu)
i == estacao   →  translate-y-0
i >  estacao   →  -translate-y-9   (esperando em cima)
```

Avançar move as duas para baixo ao mesmo tempo — a que sai continua
descendo, a que entra desce para o lugar. Voltar espelha isso sozinho.
Movimento na mesma direção, sem tempo morto dos dois lados, 440 ms.

Medido depois: sequência `0 → 1 → 2 → 3`, intervalos de 631/602/657 ms
contra uma transição de 440 ms. **Nenhuma troca mais rápida que a
transição.**

> Se mexer na duração, meça de novo com roda. Ela precisa continuar
> **menor** que o intervalo típico entre trocas, senão a tremida volta.

## ⚠️ A medição acima foi feita com roda lenta — e escondia o resto

"Intervalo típico" era a armadilha. Medindo os três regimes de scroll
separadamente, a conclusão muda:

| regime | trocas | intervalo |
|---|---|---|
| roda lenta (60 px a cada 60 ms) | 3 | 1387 / 1816 ms ✅ |
| roda comum (120 px a cada 30 ms) | 3 | 615 / 653 ms ✅ |
| **fling para baixo** (400 px sem pausa) | 2 | **275 / 179 ms** ❌ |
| **fling para cima** | 2 | **339 / 211 ms** ❌ |

No fling a transição de 440 ms era cortada pela metade: o bloco novo
nunca chegava a opacidade 1 nem ao lugar dele, e já era substituído.
E o fling não é caso de borda — é como se atravessa uma página longa.

Duas causas, as duas no `quadro()` de `cenas.ts`:

**1. A parada andava de uma em uma, por quadro.** Era
`estacaoAtual + 1`. Numa passagem rápida a câmera cruza duas paradas e
as duas eram renderizadas — a do meio só para ser trocada em seguida.
Agora vai direto para `Math.round(escala)`, mantendo a zona morta como
condição de disparo.

**2. Nada garantia que a transição anterior tivesse terminado.** Entrou
um **tempo mínimo de permanência**: nenhum aviso novo sai antes de
`MS_TROCA_PARADA` desde o último. Quando a espera acaba, anuncia a
parada em que a câmera está **naquele momento** — então o fling passa a
mostrar só onde ele parou, que é a única parada que dá tempo de ler.

Os 440 ms agora são **um número só**, `MS_TROCA_PARADA` em
`src/lib/motion.ts`, lido pelos dois lados: `Sala.tsx` como duração da
transição CSS e `cenas.ts` como tempo de permanência. Eles não podem
divergir — `Sala.tsx` não pode importar de `cenas.ts` sem arrastar o
three.js para o pacote principal, e por isso a constante mora no
`motion.ts`, que os dois já usam.

Medido depois da correção, em seis regimes:

```
fling para baixo (25 × 400px)      0 → 1              nenhum intervalo < 440ms
fling violento   (12 × 1200px)     0 → 1              nenhum intervalo < 440ms
salto de barra   (scrollTo)        0 → 1 → 2 → 3      449 / 449 ms
vai-e-volta      (3000 e volta)    0 → 1 → 2 → 1 → 0  460 / 457 / 446 ms
sacudida na fronteira (±40px, 40×) nenhuma troca
roda comum       (45 × 120px)      0 → 1 → 2 → 3      960 / 926 ms
```

Em repouso, cada parada fica sozinha na tela — opacidades
`[1,0,0,0]`, `[0,1,0,0]`, `[0,0,1,0]`, `[0,0,0,1]` — sem resto da
anterior por baixo.

> ⚠️ O tempo de permanência **segura** o aviso; ele não o perde. Mas o
> laço de render só roda com a seção na tela, então um fling que
> atravessa a seção inteira a deixa numa parada intermediária enquanto
> ela está fora de vista. Ao voltar, o laço reabre e corrige sozinho —
> conferido: atravessar para `y+12000` e voltar ao fim do trilho
> devolve a parada 3, com a barra em 0,99.

> **Ao medir isto de novo, teste o fling.** Roda lenta passa em
> qualquer versão do código, inclusive nas quebradas — foi exatamente
> ela que deu o veredito errado da primeira vez.

## ⛔ E MESMO ASSIM tremia — o `translate` nunca foi animado

As duas rodadas acima consertaram **quando** a troca acontece. A
tremida continuou, porque o problema era **o que** acontecia.

A classe era `transition-[opacity,transform]` com `translate-y-9`.
**No Tailwind v4 `translate-y-*` escreve a propriedade `translate`, não
`transform`.** Então `transform` valia `none` — nunca teve o que animar
— e `translate` ficava **fora** da lista de transição. Medido, no
mesmo quadro:

```
651ms  bloco que sai:   opacidade 1.00   translate 0px 36px
       bloco que entra: opacidade 0.00   translate 0px
```

O texto **teleportava 36px em opacidade cheia**, e só depois o
esmaecimento de 440ms rodava com os dois blocos parados. Todo o
mecanismo "tudo desce junto" descrito acima **nunca rodou uma vez**.

> **A regra que sai disso: no Tailwind v4, `translate-*`, `scale-*` e
> `rotate-*` são as propriedades individuais `translate`, `scale` e
> `rotate` — não `transform`.** Uma lista de transição escrita à mão
> que diga `transform` some com todas as três, sem erro nenhum: a
> propriedade existe, o valor é válido, e a animação simplesmente não
> acontece.

Nenhuma leitura de código pegou isso em duas rodadas. O que pegou foi
amostrar `getComputedStyle` quadro a quadro e reparar que a coluna do
deslocamento estava sempre zerada.

## A troca hoje: revela como cópia no banho

O bloco chega desfocado e deslocado, e **resolve**. É o mesmo gesto do
hero (a foto entra fora de foco e encontra o assunto) e da variante
`foco` do `<Reveal>` — vocabulário que a página já fala.

Não é só estética. Durante a troca os dois blocos coexistem por alguns
quadros, e **o olho trava no nítido**. Com um esmaecimento puro os dois
disputam em pé de igualdade, e dois textos legíveis empilhados é
exatamente o que se lê como tremida.

| | entra | sai |
|---|---|---|
| opacidade | 440 ms `--ease-out` | 200 ms `--ease-out` |
| desfoque | 7px → 0, 440 ms | 0 → 7px, 200 ms |
| deslocamento | ∓32px → 0, 440 ms `--ease-out` | 0 → ±32px, **360 ms `--ease-inout`** |

Três decisões, todas com motivo medido:

**A saída é mais curta que a entrada.** As duas começam no mesmo
instante, então quem sai precisa sumir antes que quem entra fique
legível. Iguais, dá para ler os dois.

**O deslocamento da saída tem curva própria.** Com `--ease-out` — que
arranca forte de propósito, porque é curva de *entrada* — o texto que
saía dava um pinote de 22px num único quadro ainda com 31% de
opacidade. Lido como solavanco. Com `--ease-inout` ele **dissolve
parado**: some em 200 ms tendo andado ~4px, e só deriva para fora
depois, já invisível. Os 360 ms terminam sem plateia.

**As propriedades animadas são escritas em `style`, não em classe.**
É o que torna impossível repetir o bug acima: a propriedade declarada e
a propriedade na lista de transição são forçosamente a mesma coisa,
sem utilitário no meio para divergir.

Medido depois, com `getComputedStyle` a cada quadro:

```
571ms  sai   op 1.000  translate 0px          blur 0px
591ms  sai   op 0.571  translate 0px 0.06px   blur 3.00px
614ms  sai   op 0.174  translate 0px 0.58px   blur 5.78px     ← já sumiu, andou 0,6px
591ms  entra op 0.218  translate 0px -25.0px  blur 5.47px
614ms  entra op 0.541  translate 0px -14.7px  blur 3.21px
680ms  entra op 0.843  translate 0px  -5.0px  blur 1.10px
```

- quadros com dois textos legíveis (op > 0,35 e blur < 2,5px): **0**
- `transition-property` calculado: **`opacity, filter, translate`** ✅
- tempo de quadro parado × durante as trocas: **16,7 ms nos dois**,
  máximo 33,4 ms, nenhum quadro acima de 34 ms — as camadas de
  composição do `blur` não custam nada mesmo com a cena 3D rodando

Conferido também **de olho**, com `Page.startScreencast` do próprio
Chrome e folha de contato dos quadros — não só por número.

`inert` entrou junto nos blocos ocultos: `pointer-events-none` não tira
do Tab, e sem ele o botão da última parada recebia foco invisível.

## A barra de rolagem

Padrão (`scrollbar-width` / `scrollbar-color`) com o bloco
`::-webkit-scrollbar` embaixo para motores velhos — e são exclusivos:
onde o padrão existe (Firefox, Chrome 121+, Safari 18.2+), os
pseudo-elementos webkit são ignorados. É por isso que o hover mora só
no bloco webkit.

O polegar é `--color-lilas-400` a 26–30%. Não é cinza de propósito:
sobre `#0a0911` um cinza neutro é a única coisa da tela sem a hue do
lilás, e aparece como sujeira — o mesmo motivo pelo qual os neutros da
paleta são tingidos (`docs/08-paleta.md`).

No caminho webkit o polegar tem `border: 3px solid transparent` com
`background-clip: content-box`: o traço fica com 4 px, mas a área de
agarre continua com os 10 px inteiros. Barra fina que não dá para pegar
é pior que barra grossa.

A barra do percurso enche continuamente: `aoProgredir` entrega o progresso
0→1 a cada quadro e a `<ol>` recebe numa custom property `--p`. Cada barra
cobre um quarto: `scaleX(clamp(0, calc(var(--p) * 4 - i), 1))`. Nada disso
passa por estado do React — seria um render por quadro.

## Conferir de olho, não de cabeça

```bash
npm run dev
node _shot.mjs http://localhost:3000/ ./shots   # capturas em 10 posições
```

O script também reporta quantos `[data-reveal]` ficaram sem revelar. Foi
assim que o bug do `clip-path` apareceu — **54 elementos, 7 travados** — e
não teria aparecido por leitura de código.
