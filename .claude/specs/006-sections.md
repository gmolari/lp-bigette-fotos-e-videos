# Spec 006 — Seções: banco de fotos × onde cada foto aparece

> ➕ **Spec 007 (29/09/2026)** acrescentou as seções **Sobre** e **Vídeo**, a proporção de
> cada seção e os avisos de orientação/largura. O inventário completo de mídia está lá.

**Status:** ✅ entregue em 29/09/2026 · migration `0004` aplicada (semente: 3 fotos no cordel e nas polaroides) · depende da 005

## Pedido

1. `/pictures` vira só o **banco de imagens**: sobe as fotos, e só
2. `/sections` **atrela** fotos do banco a cada seção e **ordena** dentro dela
3. Seções: **banner geral**, **cordel de fotos** (varal) e **a última seção** (polaroides)
4. Estipular quantas fotos cada seção pede, e o painel dizer se falta ou sobra
5. Repetição: **só a partir de 4 fotos** elas repetem para preencher os lugares.
   Abaixo disso, as da seção entram uma vez cada e o resto é completado com as provisórias

## Quantas fotos por seção

| Chave | Nome no painel | Lugares | Ideal | Por quê |
|---|---|---|---|---|
| `hero` | Banner geral | 1 | **1** | Foto de fundo em tela cheia (`sizes="100vw"`, `object-cover`). Deitada, assunto no centro: no celular as laterais são cortadas. É a imagem de LCP |
| `portfolio` | Cordel de fotos | 7 | **7** | `N = 7` prints em `cenas.ts`. Misturar em pé e deitadas; número **par** em pé fecha a grade de 2 colunas (docs/09) |
| `closing` | Última seção | 12 | **12** | `QTD = 12` polaroides em `cenas.ts`. Recorte ~234×220, quase quadrado: qualquer orientação |

`ideal = lugares` nas três: é onde nenhuma repete e nenhuma sobra. Tudo em
`SECTION_RULES` (`modules/sections/domain/section.ts`). **Se `N` ou `QTD` mudarem em
`cenas.ts`, mude aqui também.**

## A regra de repetição — `resolveSection`

| Fotos na seção | O que a página mostra |
|---|---|
| 0 | só as provisórias (`content.sala.fotos`; no banner, `content.hero.foto`) |
| 1 a 3 | as da seção, **uma vez cada**, + provisórias até completar os lugares |
| **4 ou mais** (`REPEAT_FROM`) | **só as da seção**. Varal: cicla/corta em 7. Polaroides: ciclam até 12 |
| mais que os lugares | varal pendura as 7 primeiras (a grade sem 3D mostra todas); polaroides as 12 primeiras; banner só a 1ª |

"Acima de 4" no pedido era ambíguo; ficou **a partir de 4**. É uma constante.

Exemplos: cordel com 3 → 3 dela + 4 provisórias, nada repete. Polaroides com 3 → 3 dela
+ 9 provisórias (as 7 provisórias ciclam; as dela não). Cordel com 5 → 5 dela, duas
aparecem duas vezes.

O painel mostra o estado com a mesma aritmética (`sectionStatus`): vazia · completada com
N provisórias (faltam X para usar só as suas) · repetindo (mais X e nenhuma repete) ·
completa · N a mais. No cordel, avisa número ímpar de fotos em pé (só a partir de 4 —
abaixo disso a grade inclui provisórias).

## Banco

Migration `0004_create_section_pictures`:

- enum `page_section ('hero','portfolio','closing')`
- `section_pictures (section, picture_id → pictures ON DELETE CASCADE, position)`,
  **PK (section, picture_id)** — a mesma foto pode estar em várias seções, mas uma vez
  por seção. Índice `(section, position)`. **RLS ligado**
- **Semente escrita à mão:** as fotos que já existiam entram em `portfolio` e `closing`
  na ordem de `pictures.position`. Antes desta spec a LP mostrava todas elas nesses dois
  lugares; sem a semente, o deploy trocaria as fotos pelas provisórias. O banner nunca
  usou o banco: nasce vazio

`pictures.position` **ficou em desuso** (a ordem agora é por seção). Continua preenchida
porque é NOT NULL; sai numa migration futura — remoção de coluna é em dois passos
(`.claude/architecture/README.md`).

Excluir foto do banco → sai de todas as seções (cascade). Tirar da seção → continua no banco.

## Código

| Onde | O quê |
|---|---|
| `modules/sections/domain/section.ts` | `SECTION_KEYS`, `SECTION_RULES`, `REPEAT_FROM`, `resolveSection`, `sectionStatus`, esquemas zod |
| `modules/sections/application/sections.ts` | `getBoard` (banco + seções + onde cada foto está), atribuir, tirar, reordenar |
| `modules/sections/infrastructure/repository.ts` | lê `pictures` direto (exceção consciente: uma ida ao banco). `append` e `reorder` são uma instrução só (`unnest … with ordinality`) |
| `modules/sections/actions.ts` | `getSectionsBoard`, `assignSectionPictures`, `unassignSectionPicture`, `reorderSectionPictures` — toda escrita devolve o quadro inteiro e faz `updateTag("pictures")` |
| `modules/sections/index.ts` | `getPublishedSections()` — `unstable_cache`, tag `pictures` |
| `lib/portfolio.ts` | `fotosDasSecoes()` → `{ hero, portfolio, closing }` já resolvidas com as provisórias |
| `app/page.tsx` | `<Hero foto>`, `<Sala fotos>`, `<CtaFinal fotos>` |

Do módulo `pictures` saíram: `listPanelPictures`, `reorderPanelPictures`,
`reorderPictures`, `getPublishedPictures`, e `position` do tipo público `Picture`.

## Painel

- **`/pictures`**: envio em lote (spec 005) + **Banco de fotos** — grade, mais novas
  primeiro, com as seções onde cada foto está ("Fora do site" se nenhuma). Excluir avisa
  de quais seções a foto vai sair
- **`/sections`**: um cartão por seção — onde aparece, recomendação, contagem
  ("3 de 7"), estado, lista ordenável (react-dnd, ← →, ✕ tira da seção sem apagar),
  e **Adicionar fotos**: seletor do banco com marcação múltipla; as marcadas entram no
  fim, na ordem em que foram marcadas; as que já estão na seção aparecem travadas
- As duas telas leem a **mesma** consulta (`BOARD_QUERY_KEY`): mexeu numa, a outra já vê
- **Um `PanelDndProvider` por tela** — o HTML5Backend não aceita dois. Cada seção usa um
  `type` de arrasto próprio (`picture:hero`…): foto do banner não cai no meio do varal

## Verificação

| O quê | Resultado |
|---|---|
| `resolveSection` e `sectionStatus` | ✅ vazia · 1–3 completa sem repetir as dela (7 e 12 lugares) · ≥4 só as dela · banner |
| Migration + semente + casos de uso, em transação com **ROLLBACK** no Postgres de produção | ✅ semente: 3 no cordel e 3 nas polaroides, na ordem antiga, banner vazio · duplicata ignorada · reordenar uma seção não mexe na outra · lista incompleta recusada · tirar da seção mantém no banco · foto inexistente recusada · excluir do banco tira de todas (cascade) · tabela não existe depois |
| Build | ✅ `/` segue estática; sem a tabela, cai nas provisórias com aviso |
| Depois da migration (produção) | ✅ HTML com as 3 fotos do banco + provisórias completando; banner com a provisória |

## ❌ Não verificado

- **As telas** `/pictures` e `/sections` num navegador (o Chromium não abre neste WSL)
- **O banner vindo do banco** na prática: `/_next/image` sobre `/media/…` com `priority`.
  Na 1ª visita depois de trocar a foto, o otimizador busca no Blob pela rota — um pouco
  mais lento só nessa vez
