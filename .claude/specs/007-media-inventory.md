# Spec 007 — Inventário de mídia: toda imagem e vídeo da página, com proporção

**Status:** ✅ entregue em 29/09/2026 · migration `0005` aplicada · depende da 006

## Pedido

1. Botão "Adicionar fotos" com o rótulo quebrado
2. Levantar TODAS as fotos da aplicação e o vídeo
3. Vídeo: nada de upload agora — **link do YouTube**
4. Criar as seções e os espaços no painel, **com as proporções**

## 1 — O rótulo quebrado

`Button` põe o texto num `<span>`, e o ícone ia junto em `children`. O reset do
Tailwind faz **todo `<svg>` ser `display: block`**: ícone numa linha, rótulo na de baixo,
estourando a altura fixa do botão. Correção na raiz: prop `icon` no `Button`, fora do
`<span>` (o spinner do `loading` ocupa o mesmo lugar). Registrado em
`.claude/design-system/components.md`.

## 2 — O inventário

Levantado por busca de `<Image`, `<img`, `Placeholder`, `url(`, extensões e "video" em
`src/components/sections`, `ui`, `layout`, `opengraph-image`, `manifest`, `jsonld`.

| Onde na página | Antes | Agora | Lugares | Proporção na tela | Sem foto |
|---|---|---|---|---|---|
| **Banner** (Hero) | `/hero.jpg` | seção `hero` | 1 | tela cheia (100vw, `cover`) — **deitada 16:9/3:2, ≥1920 px** | provisória |
| **Cordel** (Sala, varal 3D) | `content.sala.fotos` | seção `portfolio` | 7 | print em pé **4:5**, deitado ~**7:5**; grade 3:4 / 3:2 | provisórias |
| **Vídeo** (Video) | espaço reservado 4:5 | seção `video` = **link do YouTube** + capa | 1 + 1 | **16:9** ou **9:16** (Shorts), conforme o vídeo | espaço reservado |
| **Sobre** (Sobre) | espaço reservado 1:1 | seção `about` | 1 | **1:1** | espaço reservado |
| **Última** (CtaFinal, polaroides) | `content.sala.fotos` | seção `closing` | 12 | ~**1,06:1** (234×220 no papel) | provisórias |
| Ícone / logo | `/icon.png` | — fica em arquivo | — | 512×512 | — |
| Card de compartilhamento | `opengraph-image.tsx` (só texto, gerado no build) | — sem foto | — | 1200×630 | — |

**Sobre e Vídeo não têm provisória**, de propósito: `docs/06-pendencias.md` já dizia
*"pôr um rosto qualquer no lugar do dela seria pior que o espaço vazio"*. `SECTION_RULES.fallback = false`.

O painel mostra a proporção de cada seção e **avisa**:
- foto na orientação que o quadro mais corta (banner em pé; capa em pé num vídeo 16:9 e vice-versa)
- banner com menos de **1920 px** de largura (`minWidth`) — pode borrar em tela grande

## 3 — Vídeo por link

| Peça | Como |
|---|---|
| Reconhecer o link | `parseYouTubeUrl` (domínio, cliente e servidor): `watch?v=`, `youtu.be/`, `shorts/` (sugere vertical), `embed/`, `live/`, `m.` — id de 11 caracteres |
| Validar | oEmbed público do YouTube, sem chave (`infrastructure/youtube.ts`). Conferido: existente → 200 com `title`; inexistente → 400. Qualquer 4xx (privado, sem incorporação) → erro no campo do link |
| Guardar | `section_videos (section PK, youtube_id CHECK 11 chars, format enum landscape/vertical, title)` — um por seção, RLS ligado |
| Mostrar | **fachada** (`components/ui/VideoYouTube.tsx`): capa + ▶. O iframe só entra no clique, e é o **`youtube-nocookie.com`** |
| Capa | a foto da seção `video` ou, sem ela, a miniatura `i.ytimg.com/vi/<id>/hqdefault.jpg` (único host de fora liberado no otimizador) |

**Por que fachada:** o iframe do YouTube baixa mais que a página inteira — mesmo motivo que
tirou o embed do Instagram (D4) — e grava cookie, o que quebraria a promessa de "sem banner
de consentimento" (D9). Antes do clique não há requisição nenhuma ao YouTube: a capa passa
pelo `/_next/image`, do nosso domínio.

**Não fiz dado estruturado `VideoObject`:** o Google exige `uploadDate`, que o oEmbed não
dá. Sem ele o schema é inválido — melhor ausente.

## 4 — Banco

Migration `0005_media_about_video`: enum `video_format`, `page_section` ganha `video` e
`about` **no fim** (inserir no meio exige recriar o tipo; a ordem de exibição é
`SECTION_KEYS`), tabela `section_videos` com RLS.

⚠️ **Valor novo de enum não pode ser usado na mesma transação em que foi criado**
(`55P04 unsafe use of new value`). Por isso o ensaio com ROLLBACK só provou que a
migration aplica; gravar Sobre/Vídeo de verdade só dá para testar depois de aplicada.

## Verificação

| O quê | Resultado |
|---|---|
| `parseYouTubeUrl` — 8 formas | ✅ watch (com `&t=`), youtu.be (com `?si=`), shorts → vertical, m., embed; vimeo, id curto e texto recusados |
| oEmbed real | ✅ existente → título; inexistente → `null` |
| `setSectionVideo` (repositório falso + oEmbed real) | ✅ grava id, formato e título; inexistente → erro no campo `url` |
| Sobre/Vídeo vazios | ✅ `resolveSection([], [], 1)` → `[]` → espaço reservado |
| Migration em transação no Postgres de produção | ✅ os 4 comandos aplicam; leitura do enum novo barrada pelo próprio Postgres (esperado); nada ficou |
| Build | ✅ `/` segue estática |
| Texto do painel no pacote da LP | ✅ nenhum chunk da `/` tem; o único chunk com texto do painel é carregado só por rotas do painel |

| **Depois da migration, banco + YouTube reais** | ✅ Sobre gravado · vídeo gravado com título e capa · trocar o link grava por cima · inexistente recusado · a página recebe os dois · tudo desfeito, estado idêntico ao anterior |

## ❌ Não verificado

- As telas do painel e a fachada do vídeo num navegador (sem Chromium neste WSL)
