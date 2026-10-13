# Spec 008 — Textos das seções editáveis no painel

**Status:** ✅ entregue em 13/10/2026 · migration `0006` aplicada em 13/10/2026 · depende da 006/007

## Pedido

1. Cadastrar os textos das seções pelo painel, **nas configurações das seções** (`/sections`)
2. Quais seções e quais campos: escolhidos um a um pelo Guilherme (tabela abaixo)
3. **Tem de existir texto padrão**, que pode ser alterado

## O que pode e o que não pode ser alterado

Escolhido campo a campo em 13/10/2026. O que está em "fixo" continua só em `content.ts`.

| Seção | Chave | Editável no painel | Fixo no código |
|---|---|---|---|
| Hero | `hero` | eyebrow, título, lead, selo de escassez | texto do botão |
| Faixa de impacto | `band` | frase 1, frase 2 | — |
| Experiência | `experience` | os 3 cartões (título + texto) | eyebrow, título, lead, gatilho, quantidade (3) e numeração |
| Varal (portfólio) | — | nada | tudo |
| Depoimentos | `testimonials` | frases + contexto, **incluir/remover/ordenar** (1 a 8) | eyebrow, título, gatilho |
| Vídeo | `video` | título, lead, gatilho (frase + botão) | eyebrow |
| Como funciona | — | nada | tudo |
| Sobre | `about` | título, parágrafos (1 a 4) | eyebrow, gatilho |
| FAQ | `faq` | perguntas e respostas, **incluir/remover/ordenar** (1 a 12) | eyebrow, título, gatilho |
| CTA final | — | nada | tudo |

Nenhum `source` de WhatsApp é editável (regra do projeto).

## Padrão × personalizado

- O **padrão** é o `src/config/content.ts`, como sempre foi. `DEFAULT_TEXTS`
  (`modules/sections/domain/texts.ts`) tira dele só os campos editáveis.
- O banco guarda **só o personalizado**: tabela `section_texts (section text PK, content jsonb, updated_at)`,
  uma linha por seção, com o conteúdo editável **inteiro** da seção. RLS ligado.
- Sem linha → padrão. **"Voltar ao texto padrão" = apagar a linha** (dois cliques: pede confirmação).
- `resolveTexts` valida cada linha com o esquema zod de HOJE. Linha que não passa (o formato
  mudou depois de gravada) é ignorada e a seção volta ao padrão — nunca derruba a página.
- ⚠️ Texto personalizado **não acompanha** mudança posterior no `content.ts`: quem mandar é a linha do banco.

`section` é `text`, não o enum `page_section`: as seções com texto não são as que têm foto,
e valor novo de enum não pode ser usado na transação que o cria (spec 007).

## Painel

`/sections` passou a mostrar **a página inteira na ordem** (`PAGE_LAYOUT`): as seções de foto
ganham um bloco "Textos" embaixo; as que só têm texto (Faixa, Experiência, Depoimentos, FAQ)
ganham um cartão próprio. Banco de fotos vazio não trava mais a tela — os textos aparecem do mesmo jeito.

- Bloco fechado por padrão, com selo **Texto padrão / Personalizado**
- Formulário desenhado por descrição (`components/panel/sections/textForms.ts`) e validado com
  o MESMO esquema zod da action; o erro acha o campo pelo caminho (`items.2.q`)
- Listas: incluir, remover, subir/descer. Experiência tem tamanho fixo
- **FAQ: a primeira pergunta não sai do topo nem pode ser removida** — é "Quanto custa?",
  aberta por padrão (decisão D1). O texto dela pode mudar; a posição, não.
  ⚠️ Isso é trava do PAINEL: o servidor só exige ≥ 1 pergunta e abre a primeira
- Componente novo: `ui/Textarea.tsx` (já especificado no design system)

## Landing page

- `src/lib/page-texts.ts` → `getPageTexts()`, lido em `app/page.tsx` e passado por prop
  (`textos`) a Hero, FaixaImpacto, Experiencia, Depoimentos, Video, Sobre e Faq
- Cache: `getPublishedSectionTexts` (`unstable_cache`, mesma tag das fotos). `/` segue estática
- **Consulta separada da das fotos, de propósito:** falha nos textos → textos padrão, fotos intactas
  (e vice-versa). Na primeira versão `getPublished` lia os dois juntos e, sem a tabela, a página
  perdia as fotos — pego no build, corrigido com `loadMedia`
- **JSON-LD `FAQPage` saiu do layout raiz** e é emitido por `app/page.tsx` com as mesmas perguntas
  da tela. O layout raiz também embrulha o painel e não deve ir ao banco. `<` escapado no JSON
- Depoimentos: as colunas do desktop acompanham a quantidade (1, 2, 3 ou 4+)
- `{CIDADE}` `{PRAZO}` `{RAIO}` continuam valendo nas perguntas e respostas

## Deploy

A migration já está aplicada (13/10/2026) — a tabela existe e o código antigo não a enxerga.
Falta só o deploy do código.

## Verificação

| O quê | Resultado |
|---|---|
| `tsc`, lint | ✅ limpos |
| O padrão de `content.ts` passa nos 7 esquemas | ✅ |
| `resolveTexts`: sem linha → padrão · linha válida troca só a seção · linha inválida/desconhecida → padrão | ✅ |
| `saveTextSchema`: apara espaços · recusa conteúdo de outra seção, seção desconhecida, lista vazia, campo em branco, Experiência ≠ 3 | ✅ |
| Caminho do erro (`items.0.quote`) e mensagem em português | ✅ |
| Gravar por cima e voltar ao padrão no banco real (transação com ROLLBACK) | ✅ |
| Build de produção sem a tabela | ✅ `/` estática, fotos do banco lidas, textos padrão no HTML, 6 `Question` no JSON-LD |
| Texto do painel no pacote da LP | ✅ nenhum chunk referenciado por `/` tem |

## ❌ Não verificado

- Gravar e voltar ao padrão **pela action** (o repositório foi testado; a action com sessão, não)
- **As telas do painel num navegador** (editor, listas, estados de erro)
- A LP com texto personalizado de verdade (só o caminho do padrão rodou)
