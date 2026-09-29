# Design system — painel

> Escopo: a área escondida (`src/app/(panel)`). A landing page tem linguagem
> própria, documentada em `docs/08-paleta.md` e `docs/09-movimento-3d.md` — o
> painel **herda os tokens** dela, não os componentes.

| Arquivo | O quê |
|---|---|
| este | princípios, tokens, status de implementação |
| `components.md` | catálogo, API e **estados** de cada componente |
| `motion.md` | tokens de movimento, padrões, movimento reduzido |

## Princípios

1. **Um só sistema de cor.** Tokens do `@theme` em `globals.css`; nada de hex solto
   no componente. Mudou cor → rodar `docs/paleta.mjs` e conferir contraste.
2. **Todo estado é desenhado.** Nenhum componente interativo existe sem os estados
   da tabela em `components.md` — especialmente foco, carregando e erro.
3. **Movimento explica, não enfeita.** Anima entrada, mudança de estado e relação
   espacial. Nunca em loop, nunca bloqueando o clique.
4. **Clicável parece clicável.** `cursor: pointer` vem da regra base em
   `globals.css` para todo `button`/`[role=button]`/`select`/`label[for]` — não
   precisa pôr `cursor-pointer` em cada componente. Hover sempre muda algo visível.
5. **Acessível por padrão.** Foco visível sempre, `aria-*` embutido no componente
   (não responsabilidade de quem usa), alvo de toque ≥ 36 px (44 px no primário).
6. **Mesmo vocabulário da marca.** O "foco de lente" (desfocado → nítido) é o gesto
   da LP e é a entrada padrão de bloco no painel.

## Tokens

### Cor (de `globals.css`)

| Papel | Token Tailwind | Uso |
|---|---|---|
| Fundo página | `bg-bg` | fundo |
| Superfície | `bg-bg-2` | cartão, formulário |
| Superfície elevada | `bg-bg-3` | hover de item, pílula ativa, ícone |
| Texto | `text-cream` | texto principal |
| Texto secundário | `text-muted` | legenda, hint, ícone inativo |
| Borda | `border-line` / `border-line-forte` | repouso / hover |
| Ação | `bg-accent` + `text-ink` | botão primário |
| Ação hover | `bg-accent-2` | |
| Foco (botão/link) | `outline-accent-2` | contorno 2px, só teclado (`focus-visible`) |
| Foco (campo) | `.field-control:focus-within` | borda `accent` 75% + halo 4px 16% + brilho difuso |
| Destaque | `text-ouro` | eyebrow, numeração. **Nunca em bloco** |
| Erro | `text-erro`, `border-erro`, `bg-erro/10`, `bg-erro` + `text-erro-ink` | |
| Sucesso | `text-sucesso`, `bg-sucesso/10` | |

Contraste de erro e sucesso: `docs/08-paleta.md` (17/17 pares passam, 15 em AAA).

### Tipografia

| Papel | Classe |
|---|---|
| Título de página | `font-display text-3xl` |
| Título de seção/estado vazio | `font-display text-xl` |
| Eyebrow | `text-xs font-semibold uppercase tracking-[0.2em] text-ouro` |
| Corpo | `text-[0.95rem]` / `text-sm` |
| Rótulo | `text-sm font-medium` |
| Hint / erro de campo | `text-xs` |

### Espaço, raio, elevação

- Escala de espaço do Tailwind (múltiplos de 4 px). Formulário: `gap-5`. Cartão: `p-7 sm:p-8`.
- Raio: `rounded-xl` (campo, alerta) · `rounded-2xl` (cartão de conteúdo) ·
  `rounded-3xl` (cartão de formulário) · `rounded-full` (botão, pílula).
- Elevação: só o cartão de formulário leva sombra (`shadow-2xl shadow-black/40`).
  O resto separa por cor de superfície, não por sombra.

### Alturas de controle

| Tamanho | Altura | Uso |
|---|---|---|
| `sm` | 36 px (`h-9`) | barra, ação secundária densa |
| `md` | 44 px (`h-11`) | padrão; campos |
| `lg` | 52 px (`h-13`) | ação principal de formulário |

## Status de implementação

| Componente | Status | Arquivo |
|---|---|---|
| Button | ✅ | `components/panel/ui/Button.tsx` |
| Field (input texto) | ✅ | `ui/Field.tsx` (casca em `ui/FieldShell.tsx`) |
| PasswordField (olho) | ✅ | `ui/PasswordField.tsx` |
| Select (nativo) | ✅ | `ui/Select.tsx` |
| Badge | ✅ | `ui/Badge.tsx` |
| Panel (cartão de seção) | ✅ | `ui/Panel.tsx` |
| PageHeader | ✅ | `components/panel/PageHeader.tsx` |
| ActionAlert | ✅ | `ui/ActionAlert.tsx` |
| ErrorScreen | ✅ | `components/panel/ErrorScreen.tsx` |
| Alert | ✅ | `ui/Alert.tsx` |
| EmptyState | ✅ | `ui/EmptyState.tsx` |
| Spinner | ✅ | `ui/Spinner.tsx` |
| PanelNav (pílula animada) | ✅ | `components/panel/PanelNav.tsx` |
| Textarea, Checkbox, Switch | 📐 especificado | — |
| Dialog, Toast, Skeleton, Card, Tabs | 📐 especificado | — |
| Upload de imagem | ⏳ aguarda definição de `/pictures` | — |
