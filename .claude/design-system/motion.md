# Movimento — painel

Biblioteca: **`motion`** (o Framer Motion renomeado). Importar de `motion/react`.
Tokens em `src/components/panel/motion/tokens.ts`.

## Regras de montagem

- **`LazyMotion features={domAnimation} strict`** no `Providers` do painel: usar
  **`m.div`**, nunca `motion.div` (o `strict` acusa). ~5 KB em vez de ~34 KB.
- **`MotionConfig reducedMotion="user"`**: com `prefers-reduced-motion`, Motion
  anula transform e mantém opacidade. Não precisa checar à mão.
- Motion **só no painel**. A LP segue com CSS + `Reveal` (`docs/09-movimento-3d.md`) —
  conferido que nada de Motion entra no pacote dela.
- Anime `opacity`, `transform` (`x`, `y`, `scale`) e `filter`. Nunca `width`/`height`/`top`
  (use `layout` se precisar).

## Tokens

| Duração | s | Uso |
|---|---|---|
| `instant` | 0,10 | feedback de toque |
| `fast` | 0,18 | hover, **saídas** |
| `base` | 0,28 | entrada de elemento pequeno (erro de campo, alerta) |
| `slow` | 0,44 | entrada de bloco (= `MS_ENTRADA_PARADA` da LP) |
| `slower` | 0,70 | entrada de página |

| Curva | Valor | Uso |
|---|---|---|
| `ease.out` | `[0.16, 1, 0.3, 1]` | entradas (= `--ease-out`) |
| `ease.inOut` | `[0.65, 0, 0.35, 1]` | deslocamento que para nas duas pontas |
| `ease.spring` | `[0.34, 1.42, 0.64, 1]` | leve passada (= `--ease-spring`) |

| Mola | Uso |
|---|---|
| `spring.snappy` | botão, switch — responde já, sem balanço |
| `spring.gentle` | pílula de navegação, cartão |

## Padrões (variants prontos)

| Nome | O quê | Onde |
|---|---|---|
| `fadeUp` | `y: 12 → 0` + opacidade; saída `y: -6` mais curta | itens de formulário, lista |
| `focusIn` | `blur 8px → 0` + `scale .985 → 1` | entrada de bloco/página (gesto da marca) |
| `stagger` | 60 ms entre filhos | pai de lista/formulário |
| `shake` | `x` ±7 px, 360 ms | formulário recusado pelo servidor |
| `layoutId` | elemento compartilhado que desliza | pílula ativa, indicador de aba |

## Regras que vieram da LP (não reaprender)

- **Saída mais curta que entrada.** Começam juntas; quem sai precisa sumir antes de
  quem entra ficar legível (ver `docs/09-movimento-3d.md`, "revela como cópia no banho").
- **Nada anima em loop** exceto spinner.
- Duração de transição **menor que o intervalo entre trocas** — senão o elemento é
  substituído no meio da entrada.
- No Tailwind v4 `translate-*`/`scale-*` **não são `transform`**. Em componente com
  Motion isso não morde (Motion escreve `transform`), mas não misture utilitário de
  transform com `m.*` no mesmo elemento.

## Não verificado

As animações do painel ainda não foram conferidas de olho — o navegador headless
não roda neste ambiente (ver spec 002). Conferir login (entrada `focusIn` +
`stagger`, tremida no erro) e a pílula da navegação no primeiro `npm run dev`.
