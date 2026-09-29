# Paleta — derivação e conferência

> Gerada a partir de **`rgb(159 154 184)` = `#9F9AB8`**, a cor que o cliente
> mandou. Tudo aqui foi calculado, não escolhido no olho. O script está em
> `docs/paleta.mjs` — dá para rodar de novo com `node docs/paleta.mjs`.

## A cor de partida

| Espaço | Valor |
|---|---|
| HEX | `#9F9AB8` |
| HSL | H 250,0° · S 17,4% · L 66,3% |
| **OKLCH** | **L 0,7005 · C 0,0437 · H 292,88°** |

A *hue* é lilás legítimo. O problema era o **chroma 0,044** — lilás com
presença fica entre 0,09 e 0,15. A hue foi mantida em 292,88° e o chroma subiu.

## Por que OKLCH e não HSL

Em HSL, uma tríade sai com luminâncias muito diferentes entre si: o amarelo
"pula" da tela e o azul "some", mesmo com o mesmo `L`. HSL não é
perceptualmente uniforme — o `L` dele é uma média aritmética de canais, não
uma medida de brilho percebido.

OKLCH é. Mesmo `L` em OKLCH = mesmo peso visual. É o que permite construir
uma rampa em que trocar a hue não muda o quanto a cor "grita".

Toda cor fora do gamut sRGB teve o chroma reduzido por busca binária,
preservando L e H — nunca o contrário.

## As relações a partir de H = 292,88°

| Relação | Hue | Amostra (L .72 / C .14) |
|---|---|---|
| Base (lilás) | 292,88° | `#a892f4` |
| Complementar | 112,88° | `#a6ad35` |
| **Split-complementar A** | **82,88°** | **`#cf9b20`** ← escolhida |
| Split-complementar B | 142,88° | `#6cbb68` |
| Triádica A | 52,88° | `#e88949` |
| Triádica B | 172,88° | `#00c09c` |
| Análoga −30 | 262,88° | `#75a3fc` |
| Análoga +30 | 322,88° | `#ce85d7` |
| Tetrádica | 352,88° | `#e67dac` |

### Por que a split-complementar e não a complementar pura

A complementar pura cai em **verde-limão (H 112,9°)**. O verde do WhatsApp —
`#25D366`, que é cor de marca e não pode mudar — está em **H 149,7°**. São
37° de distância: duas cores parecidas disputando o mesmo papel de *"olhe
aqui"*, e a página tem 11 botões verdes.

O ouro em H 82,9° fica a 67° do verde e a 210° do lilás. Convive.

## A paleta

| Token | Hex | OKLCH | Papel |
|---|---|---|---|
| `--color-bg` | `#0a0911` | L .145 C .017 H 290° | fundo |
| `--color-bg-2` | `#161420` | L .200 C .024 H 292° | fundo alternado |
| `--color-bg-3` | `#22202f` | L .253 C .028 H 290° | cartão elevado |
| `--color-cream` | `#f3f2fa` | L .964 C .011 H 292° | texto |
| `--color-muted` | `#a9a6ba` | L .734 C .029 H 293° | texto secundário |
| `--color-lilas-200` | `#d8d0ff` | L .879 C .065 | citação, destaque claro |
| `--color-lilas-300` | `#c3b4ff` | L .809 C .105 | hover, `accent-2` |
| **`--color-lilas-400`** | **`#ac95fa`** | L .731 C .144 | **`accent` — a cor da marca** |
| `--color-lilas-500` | `#9376e8` | L .645 C .166 | gradientes |
| `--color-lilas-600` | `#775ac5` | L .550 C .160 | brilho de fundo |
| `--color-ouro` | `#e6b13f` | L .789 C .140 H 83° | eyebrow, numeração |
| `--color-ouro-2` | `#f6ca75` | L .860 C .115 H 83° | detalhe |
| `--color-ink` | `#180d32` | L .200 C .070 | texto sobre botão lilás |
| `--color-wpp` | `#25d366` | — | marca WhatsApp, fora do sistema |

Os neutros carregam a hue do lilás com chroma quase zero (0,017–0,029). É o
que faz o escuro parecer violeta profundo em vez de cinza sujo — e é a
diferença entre uma paleta e um tema escuro genérico com um destaque colorido.

O ouro aparece só em eyebrow, numeração e detalhe. **Nunca em bloco grande** —
é contraponto, não segunda cor de marca.

## Contraste — WCAG 2.1

Todos os pares em uso na página. Alvo mínimo AA (4,5:1).

| Par | Razão | Nota |
|---|---|---|
| texto sobre fundo | `#f3f2fa` / `#0a0911` | **17,82:1** AAA |
| texto sobre fundo 2 | `#f3f2fa` / `#161420` | **16,36:1** AAA |
| texto secundário sobre fundo | `#a9a6ba` / `#0a0911` | **8,35:1** AAA |
| texto secundário sobre fundo 2 | `#a9a6ba` / `#161420` | **7,66:1** AAA |
| texto secundário sobre cartão | `#a9a6ba` / `#22202f` | **6,73:1** AA |
| lilás 300 sobre fundo | `#c3b4ff` / `#0a0911` | **10,65:1** AAA |
| lilás 400 sobre fundo | `#ac95fa` / `#0a0911` | **7,96:1** AAA |
| lilás 400 sobre fundo 2 | `#ac95fa` / `#161420` | **7,30:1** AAA |
| ouro sobre fundo | `#e6b13f` / `#0a0911` | **10,12:1** AAA |
| ouro sobre fundo 2 | `#e6b13f` / `#161420` | **9,29:1** AAA |
| tinta sobre botão lilás | `#180d32` / `#ac95fa` | **7,38:1** AAA |
| tinta sobre ouro | `#221600` / `#e6b13f` | **9,07:1** AAA |
| tinta sobre WhatsApp | `#06301A` / `#25D366` | **7,33:1** AAA |
| erro sobre fundo | `#f2877b` / `#0a0911` | **8,04:1** AAA |
| erro sobre cartão | `#f2877b` / `#22202f` | **6,48:1** AA |
| tinta sobre erro | `#2a0a06` / `#f2877b` | **7,45:1** AAA |
| sucesso sobre cartão | `#7fd6a4` / `#22202f` | **9,16:1** AAA |

**17 de 17 passam. 15 em AAA.** Erro e sucesso entraram em 26/09/2026 para o
painel (`.claude/design-system/`); a página pública não os usa.

## Tipografia

| Papel | Fonte | Por quê |
|---|---|---|
| Display | **Fraunces** | Serifa variável com eixos `SOFT` e `WONK` — as terminações saem de propósito levemente tortas. É desenho com mão, não neutralidade. |
| Corpo / interface | **Instrument Sans** | Grotesca contemporânea, um pouco mais estreita e menos anônima que Inter. Aguenta texto corrido. |

Duas trocas até chegar aqui. Primeiro **Playfair Display + Inter** — o par
padrão de praticamente toda página gerada por IA. Depois **Bodoni Moda**, que
resolvia o problema errado: trocava uma didone por outra e continuava no eixo
"serifa de contraste alto = elegante", que é justamente onde mora o clichê.

Fraunces sai do eixo. Reverter é uma linha em `src/app/layout.tsx`.

O utilitário é **`font-display`**, não `font-serif` — o papel importa mais que
a classificação.

## Como mexer

Tudo mora no bloco `@theme` de `src/app/globals.css`. Os componentes usam os
apelidos de papel (`accent`, `accent-2`, `ink`), nunca a rampa direto — então
trocar a cor da marca é editar **uma** linha.

Se mudar qualquer cor, **rode o script de novo e confira o contraste antes de
subir**. A tabela acima é o contrato.
