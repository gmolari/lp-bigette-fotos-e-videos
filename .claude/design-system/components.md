# Componentes — catálogo e estados

## Matriz de estados (vale para todo componente interativo)

| Estado | Como aparece | Regra |
|---|---|---|
| **default** | repouso | |
| **hover** | borda `line-forte` ou fundo `accent-2`/`bg-3` | só em ponteiro fino; nunca a única pista de interatividade |
| **focus-visible** | botão/link: `outline-2 outline-offset-2 outline-accent-2` · campo: `.field-control:focus-within` (borda acesa, fundo `bg-2`, halo + brilho, rótulo `accent-2`) | **obrigatório**, nunca `outline-none` sem substituto |
| **active / pressed** | `scale 0.97` com `spring.snappy` | via `whileTap`, desliga quando inativo |
| **disabled** | `opacity-50`, `cursor-not-allowed` | atributo `disabled` real, não só estilo |
| **loading** | spinner + rótulo opcional, `aria-busy`, desabilitado | `opacity-80` (não 50 — não é "indisponível") |
| **invalid** | borda e anel `erro`, mensagem abaixo, `aria-invalid` + `aria-describedby` | mensagem some ao editar o campo |
| **success** | `Alert tone="success"` ou transição de rota | nunca só cor — sempre texto |
| **empty** | `EmptyState` | título + texto + ação opcional |

---

## Button ✅

`variant`: `primary` · `secondary` · `ghost` · `danger` — `size`: `sm` · `md` · `lg`
Props: `loading`, `loadingLabel`, `fullWidth`, `icon`, + tudo de `<button>`.
**Ícone vai em `icon`, nunca em `children`**: o texto fica num `<span>` e o reset do
Tailwind faz `<svg>` ser `display: block` — ícone numa linha, rótulo na de baixo.
No `loading`, o spinner ocupa o lugar do ícone. `type` padrão `"button"`
(submit é explícito — evita envio acidental).

| variant | repouso | hover |
|---|---|---|
| primary | `bg-accent text-ink` | `bg-accent-2` |
| secondary | borda `line-forte`, texto `cream` | borda `accent`, texto `accent-2` |
| ghost | texto `muted` | `bg-bg-3`, texto `cream` |
| danger | `bg-erro text-erro-ink` | `brightness-110` |

Só ícone → `aria-label` obrigatório (ex.: botão Sair).
Uma ação `primary` por tela.

## Field ✅

Props: `label` (obrigatório — sem placeholder como rótulo), `name`, `hint`, `error`,
`optionalLabel`, `trailing` (elemento dentro do contorno, à direita), + `<input>`.
IDs, `aria-invalid` e `aria-describedby` são gerados. Erro entra com `opacity + y:-4`.
Espalhe `{...field("nome")}` do `useActionForm`.

O foco **não** fica no `<input>`: fica no contorno `.field-control` (classe em
`globals.css`), via `:focus-within`, para que ícones internos (olho, chevron)
fiquem dentro da área acesa. O outline global de `:focus-visible` é desligado só
dentro do contorno.

| Estado do contorno | Aparência |
|---|---|
| repouso | borda `line`, fundo `bg` 70% |
| hover | borda `line-forte` |
| foco | borda `accent` 75%, fundo `bg-2`, halo 4px `accent` 16%, brilho `0 12px 32px -14px` |
| inválido | tudo acima tingido de `erro`; rótulo `erro` |
| desabilitado | opacidade 50%, `not-allowed` |

## PasswordField ✅

`Field` + botão de olho no `trailing`. `aria-label` alterna "Mostrar/Ocultar senha",
`aria-pressed`. `onMouseDown preventDefault` — clicar no olho não tira o foco do
campo. Visível → `autoCorrect/spellCheck` desligados. Ícone troca com
`scale + rotate` (`duration.fast`).

## Select ✅

`<select>` nativo dentro do `.field-control`, chevron decorativo. Mesmos estados do Field.

## Badge ✅

`tone`: `accent` (papel admin) · `neutral` (membro) · `ouro` ("você").

## Panel ✅

Cartão de seção de formulário: `title`, `lead`, `tone="danger"` (borda e título `erro`).

## Exclusão (padrão)

Duas etapas no mesmo lugar: botão `secondary` "Excluir" → troca (animado) por
`danger` "Confirmar exclusão" + "Cancelar". Nunca `window.confirm`.

## ActionAlert ✅

`<ActionAlert error={mutation.error | query.error} />`. Mensagem do código, `errorId`
selecionável, `<details>` com a causa técnica (só em dev), botão Recarregar em
`STALE`, ícone de wi-fi em `NETWORK`. Esconde `VALIDATION` com campos.
**É o único jeito de mostrar erro de action.**

## ErrorScreen ✅

Tela de `error.tsx`: ícone, título, texto, `digest` do Next como código,
mensagem do erro só em dev, "Tentar de novo" (`retry`) + "Ir para o início".

## Alert ✅

`tone`: `error` (`role="alert"`) · `success` / `info` (`role="status"`).
Sem `message` não renderiza — e anima entrada/saída sozinho (`AnimatePresence` interno).
Uso: erro geral de formulário (`formError`), confirmação de ação.

## EmptyState ✅

Props: `icon` (lucide), `title`, `text?`, `action?`. Borda tracejada = "espaço a preencher".

## PanelNav ✅

Links com `aria-current="page"`; a pílula do item ativo usa `layoutId` e desliza
entre itens (`spring.gentle`). Em tela estreita mostra só ícones.

---

## Especificados, ainda não implementados 📐

### Textarea
Mesmos estados do Field. Altura mínima 3 linhas, `resize-y`. Contador opcional
(`hint` vira "120/500"; passa a `erro` ao estourar).

### Checkbox / Switch
Alvo de toque 44 px mesmo com a caixa de 18 px (label clicável). Switch para
efeito imediato; checkbox para o que só vale ao enviar. Thumb do switch com `spring.snappy`.

### Dialog
`<dialog>` nativo (foco preso e Esc de graça). Entrada `fadeUp` + fundo `bg-black/60`
com fade `duration.fast`. Ação destrutiva: botão `danger` + texto que diz o que se perde.

### Toast
Canto inferior, `role="status"`, some em 4 s (erro: fica até fechar). Empilha no
máximo 3. Entrada `y: 16 → 0` + opacidade; saída só opacidade.

### Skeleton
`bg-bg-3` com brilho em gradiente (CSS, não Motion). Só depois de 300 ms de espera —
antes disso, piscar o esqueleto é pior que esperar. Com React Query:
`isPending && !data`.

### Card
`bg-bg-2 border-line rounded-2xl p-5`. Clicável → hover `border-line-forte` +
`y: -2` (`spring.gentle`) e é um `<a>`/`<button>` de verdade, não `div onClick`.

### Tabs
`role="tablist"`, setas do teclado movem o foco, indicador com `layoutId` (mesmo
gesto da PanelNav).
