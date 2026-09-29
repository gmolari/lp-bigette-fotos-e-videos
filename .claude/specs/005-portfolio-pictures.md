# Spec 005 — Fotos do portfólio: Vercel Blob + painel com ordem por arrastar

> 🔄 **Atualizada pela spec 006 (29/09/2026):** `/pictures` virou só o banco de imagens.
> A ORDEM e o "onde aparece" passaram para `/sections`. O que esta spec diz sobre
> ordenar em `/pictures`, `getPublishedPictures` e `pictures.position` vale como histórico.

**Status:** ✅ entregue em 29/09/2026 · migration aplicada · Blob conectado ao projeto na Vercel · depende da 003 e 004

## Pedido

1. Hospedar as fotos do portfólio (as que aparecem nas cenas 3D) num serviço de imagens
2. Formulário de cadastro no painel: cada envio sobe **uma** imagem
3. **react-dnd** para mudar a ordem
4. O back extrai proporção e dimensões; **máximo ~4 MB**; manter um padrão de qualidade
5. O link gerado é gravado na **nossa** tabela; a página lê de lá
6. As fotos precisam carregar **com o site**, com o cache do Next — renderizadas **no servidor (SSR)**
7. **Custo zero** nesta fase

## 🔄 Por que não é Imgur (o pedido original)

O pedido foi Imgur, e a primeira versão deste código usou a API dele.
**Não dá para obter Client-ID:** `api.imgur.com/oauth2/addclient` responde
**301 para a página inicial, sem passar pelo login** (conferido com curl em
28/09/2026 — `imgur.com/account/settings/apps`, por comparação, manda para o
login). Registro de app novo foi fechado; apps antigos seguem funcionando.
Relato independente: [Tautulli #2620](https://github.com/Tautulli/Tautulli/issues/2620), 11/12/2025.

Alternativas avaliadas, todas com as páginas abertas:

| | ImgBB | Supabase Storage | **Vercel Blob** ✅ |
|---|---|---|---|
| Uso comercial | ❌ termos proíbem sem aprovação | ✅ | ✅ (mas ver ⚠️ Hobby abaixo) |
| Excluir pela API | ❌ só `delete_url`, página web manual | ✅ | ✅ `del()`, grátis |
| Pode apagar sem aviso | ✅ "at any time and for any reason" | — | — |
| Grátis | — | 1 GB · 5 GB egress | 1 GB · 10 GB tráfego · 2.000 envios/mês |
| Estourou | — | — | store **suspenso** 30 dias, **nunca cobra** |
| Pausa por inatividade | não | ⚠️ **projeto grátis pausa após 1 semana** | não |

A pausa do Supabase decidiu: a LP é estática e em cache, então as visitas não
tocam o banco — com 30–100 visitas/mês o projeto fica "inativo" e pausa. Com as
fotos no Blob, o portfólio continua no ar mesmo com o Supabase pausado.

Fontes: [imgbb.com/tos](https://imgbb.com/tos) · [api.imgbb.com](https://api.imgbb.com/) ·
[supabase.com/pricing](https://supabase.com/pricing) ·
[Vercel Blob pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)

### ⚠️ Riscos abertos, fora do escopo desta spec

- **Plano Hobby da Vercel é "non-commercial personal use only"** — e "advertising the
  sale of a product or service" está na lista de uso comercial
  ([fair use](https://vercel.com/docs/limits/fair-use-guidelines)). Vale para o
  **site inteiro**, com ou sem Blob. Decisão pendente do cliente
- **Supabase grátis pausa após 1 semana sem atividade** — o banco (login/painel) é
  afetado. Pausado, o painel mostra `UNAVAILABLE`; a LP segue (estática + reserva)

## Fluxo

```
PAINEL /pictures
  arquivo → zod no navegador (4 MB, mime) + medição local (≥1200 px)
          → uploadPanelPicture (server action, File no corpo)
              zod de novo → sharp: formato pelos BYTES, rotação EXIF, dimensões
              → piso de 1200 px → put("portfolio/<uuid>.<ext>", access PRIVATE)
              → url gravada = "/media/portfolio/<uuid>.<ext>" (rota nossa)
              → INSERT pictures (position = max+1, no próprio INSERT)
              ↳ se o INSERT falhar: del() no Blob (sem órfã)
          → updateTag("pictures")

LANDING PAGE /
  page.tsx (Server Component) → fotosDoPortfolio()
     → getPublishedPictures()  [unstable_cache, tag "pictures"]
     → banco vazio ou fora do ar? → content.sala.fotos (as provisórias)
  → <Sala fotos> / <CtaFinal fotos> → <Palco3D fotos> → criarVaral/criarPolaroides(canvas, fotos)
  → toda imagem passa por /_next/image (grade: <Image>; 3D: urlOtimizada, w=384)
       → /_next/image busca /media/<chave> UMA vez por largura e guarda 30 dias
          → rota app/media/[...path] → get(access private) no Blob → stream
            (Cache-Control imutável + s-maxage: o CDN responde depois da 1ª vez)
```

`/` **continua estática** (`○ /  1h` no build). O banco é consultado uma vez por
publicação, não por visita. As URLs saem no HTML; nenhuma consulta depois de hidratar.

## Decisões

| Decisão | Por quê |
|---|---|
| Adaptador isolado atrás de `ImageHost` (`infrastructure/blob.ts`) | Já trocou de provedor uma vez. Trocar de novo = um arquivo (+ a rota `/media`, se o novo também for privado) |
| **Store PRIVADO + rota `/media/[...path]`** | O store que existe é privado (e o modo não muda). Em vez de pedir outro: o `/_next/image` já busca cada foto uma vez por largura e guarda 30 dias, então a rota quase não roda — e o original, com EXIF/GPS, **nunca fica público**. A rota só serve `portfolio/<uuid>.(jpg\|png\|webp)` (`STORAGE_KEY_PATTERN`); o resto é 404. **Exceção consciente** à regra "nada de route handler": é arquivo, não dado — server action não serve arquivo por URL |
| Colunas neutras: `storage_key`, sem `delete_hash` | O banco não deve saber qual é o provedor. O Blob apaga pelo próprio caminho |
| Caminho `portfolio/<uuid>.<ext>`, `cacheControlMaxAge` 1 ano | O uuid torna a URL imutável; cache longo é seguro |
| `unstable_cache` + tag, não `"use cache"` | A diretiva exige `cacheComponents` no app inteiro, e o painel lê cookie em toda tela |
| `revalidate = 3600` em `page.tsx` | Rede de segurança: build que caiu na reserva (banco fora do ar no deploy) não fica preso nela até o próximo deploy |
| `updateTag`, não `revalidateTag(tag, "max")` | Quem sobe foto abre o site para conferir. `max` serviria a versão velha nessa primeira visita |
| Imagens SEMPRE via `/_next/image` | AVIF/WebP no tamanho certo, cache de 30 dias. O Blob só é lido na 1ª vez de cada largura — poupa os 10 GB de tráfego grátis. Caminho local (`/media/…`), então **nenhum** `remotePatterns` — nenhum host de fora liberado |
| **4 MB** | O original ocupa a cota de 1 GB; a Vercel corta corpo de função em 4,5 MB e o arquivo passa inteiro pela action. `bodySizeLimit: "4.5mb"` — o padrão era 1 MB |
| **Piso de 1200 px no lado maior** | "Padrão de qualidade": a paisagem de abertura ocupa a largura do celular, ~1170 px físicos |
| Recomprime **só** com EXIF de rotação (2–8) | Foto de celular vem deitada com "gire 90°" no EXIF; sem tratar, a foto em pé vira paisagem. Nos outros casos os bytes sobem intactos. Regravada: JPEG q92 mozjpeg / WebP q92 / PNG |
| Formato pelos bytes (sharp) | GIF renomeado para .jpg é recusado |
| Banco antes do Blob ao excluir | Na ordem inversa, falha do banco deixaria a página apontando para imagem apagada. Pior caso assim: órfã no Blob (fica no log) |
| Reordenar manda a lista INTEIRA | Conjunto diferente do banco (outra aba mexeu) → `DomainError`. Um UPDATE só com `unnest(...) with ordinality` |
| Guard `"user"` em tudo | Spec 003: `/pictures` é de admin e membro |
| Erro `UPSTREAM` (spec 004) | `ECONNRESET` do Blob cairia como "banco fora do ar". Mapeamento em `blob.ts`: `BlobAccessError`/`BlobStoreNotFoundError` → `CONFIG`; `BlobStoreSuspendedError` (cota estourada) e `BlobServiceRateLimited` → `UPSTREAM` com mensagem própria; resto → `UPSTREAM` |

## Banco — migration `0003_create_pictures`

Só aditiva. `pictures`: `storage_key` UNIQUE, `url`, `alt`, `width`, `height`,
`size_bytes`, `mime`, `position`, `created_by` → `users` ON DELETE SET NULL.
CHECKs: dimensões > 0, position ≥ 0, alt não vazio. Índice em `position`. **RLS ligado.**

(Gerada de novo depois da troca de provedor — a versão com `imgur_id`/`delete_hash`
nunca foi aplicada, então não há migration corretiva.)

## Para ligar

1. ✅ **Blob Store** `store_IIC3ZhBCAkKPtz8L` (privado). Credenciais no `.env`
2. ✅ **Na Vercel:** store conectado ao projeto (aba Projects) → deploy tem `BLOB_STORE_ID` + OIDC
3. ✅ **Migration** aplicada em 29/09/2026 (4 migrations no banco). Reinicie o `npm run dev` se estava aberto
4. Envie a primeira foto — ela substitui todas as provisórias

### Autenticação

`blobEnv()` aceita dois modos, **nesta ordem**:
1. `BLOB_READ_WRITE_TOKEN` → passado ao SDK. Funciona igual no local e no deploy
2. só `BLOB_STORE_ID` → OIDC (o SDK pega o `VERCEL_OIDC_TOKEN`; no local, depois de
   `vercel env pull`). Stores novos mostram o token de leitura/escrita **vazio** no painel
   e autenticam só por OIDC

Sem nenhum → `CONFIG`. OIDC sem token local → `CONFIG` com a dica do `vercel env pull`.
`BLOB_WEBHOOK_PUBLIC_KEY` (injetada junto) não é usada.

### Por que a ordem é token → OIDC

Primeira versão fazia o contrário, seguindo a doc da Vercel ("OIDC takes precedence").
No local isso quebra: `BLOB_STORE_ID` presente sem `VERCEL_OIDC_TOKEN` → "No blob credentials".
Com o token presente, ele é a credencial que certamente existe.

## LP — o que mudou

- `page.tsx` virou `async` e passa `fotos` para `Sala` e `CtaFinal`
- `cenas.ts` não lê mais `content` em nível de módulo: `criarVaral(canvas, fotos)`,
  `criarPolaroides(canvas, fotos)`. **A sonda `HEAD` saiu**
- Tipo compartilhado: `src/lib/portfolio-tipos.ts` (`FotoPortfolio`, PT como o resto da LP)
- `formato` = `landscape` → `"paisagem"`, senão `"retrato"` (quadrada conta como retrato)
- O **varal tem 7 prints fixos**: com menos fotos repete, com mais pendura as 7
  primeiras. A grade mostra todas. O painel avisa
- Grade de 2 colunas só fecha com número **par** de retratos (`docs/09`). O painel avisa

## Painel — `/pictures`

`components/panel/pictures/`: `PicturesManager`, `UploadQueue` (envio em lote),
`SortablePictures` (react-dnd).

### Envio em lote (`UploadQueue`) — 29/09/2026

- Escolher ou arrastar **várias** fotos (`<input multiple>`), até **20 por lote**.
  Cada uma vira um cartão com prévia, dimensões, orientação e **alt próprio** (obrigatório)
- **Uma foto por chamada, em sequência.** Não dá para mandar junto: a Vercel corta o
  corpo em 4,5 MB e uma foto sozinha pode ter 4. E o Next já despacha actions uma de
  cada vez por cliente — paralelo não aceleraria
- Tudo é conferido **antes** da primeira ir (alt, tamanho, formato, 1200 px): descobrir
  no meio que a 7ª está sem descrição deixaria o lote pela metade
- Cada foto tem o próprio resultado: as que vão **saem** da fila; as que falham **ficam**
  com o erro, e reenviar não repete as que já foram. `UNAUTHENTICATED`/`STALE` param o lote
- Mesma foto duas vezes (nome + tamanho + data) não entra repetida
- A lista de ordem é atualizada **uma vez no fim** — cada consulta é uma action e entraria
  na fila entre um envio e o próximo

- **react-dnd com dois backends.** `HTML5Backend` não funciona com o dedo. Em
  `(pointer: coarse)` entra o `TouchBackend` com `delayTouchStart: 200`
- Arrasto = rascunho local; **salva ao soltar**. Recusado → volta a ordem salva + `ActionAlert`
- Botões ← → movem uma casa e salvam (teclado)
- Exclusão em duas etapas (padrão do design system)
- Soltar arquivo na área de upload é drag-and-drop nativo; o react-dnd é só para a ordem

## Verificação

| O quê | Como | Resultado |
|---|---|---|
| Casos de uso | repositório/Blob falsos + sharp real | ✅ paisagem com bytes intactos; EXIF 6 → retrato; 900 px recusado; GIF recusado pelos bytes; banco falhou → órfã apagada; reordenar; lista divergente/duplicada recusada; excluir |
| zod | `File` real | ✅ > 4 MB, GIF e alt curto recusados |
| Adaptador Blob | API real da Vercel com token falso | ✅ `put` e `del` → "This store does not exist" → `ConfigError` |
| Modos de auth | sem nada / `BLOB_STORE_ID` sem token OIDC / token falso | ✅ os três → `ConfigError` com a causa certa |
| SQL | migration + `append`/`reorder`/`delete` em transação com **ROLLBACK** no Postgres de produção | ✅ positions 0,1,2; reorder `k3@0, k1@1, k2@2`; `storage_key` duplicado → 23505; tabela não existe depois |
| Build | `npm run build` sem a tabela | ✅ `/` segue ○ (1h), caiu na reserva com aviso |
| Store público × privado | envio `access: public` no store real | ✅ recusado: "Cannot use public access on a private store" — motivou a rota `/media` |
| **Ponta a ponta no store real** | build de produção + upload pelo adaptador | ✅ upload privado → `/media/…` 200 `image/jpeg` com cache imutável → `If-None-Match` 304 → `/_next/image` w=384/828 → 200 AVIF → chave fora do padrão / outra pasta / inexistente → 404 → apagado → 404 |
| **Backend completo, tudo real** | casos de uso + Postgres de produção + Blob + sharp, depois da migration | ✅ 2 uploads (paisagem/retrato), reorder, 2 no store → removidas → 0 linhas e 0 arquivos |

## ❌ Não verificado

- **Upload pela TELA do painel**: um por vez foi usado de verdade pelo cliente (29/09 — "funcionou muito bem"). O **lote** não foi exercido num navegador (sem navegador aqui); o backend por foto é o mesmo
- **CDN da Vercel** respeitando o `s-maxage` da rota `/media` — só dá para ver depois do deploy
- **Nada no navegador**: nem a cena 3D após a refatoração, nem o arrastar/soltar,
  nem o `TouchBackend` num celular. O Chromium do Playwright não abre neste WSL
  (falta `libatk`). Conferir com `npm run shots` e à mão
- **EXIF com GPS no original**: resolvido pelo store privado — o original não tem URL
  pública. Atenção: a rota `/media` entrega o ORIGINAL a quem souber a chave (uuid,
  não adivinhável, mas aparece no HTML via `/_next/image?url=…`). Se isso importar,
  remover o EXIF no `sharpInspector` (custa recompressão)
- **Cota do otimizador na Vercel** (Hobby: 5.000 transformações/mês) — folgado para
  poucas fotos × poucas larguras, mas vale olhar o painel de uso
- Editar o alt de foto já enviada: não existe. Hoje é excluir e enviar de novo
