# SEO — o que está implementado

## Arquivos

| Recurso | Arquivo | O que faz |
|---|---|---|
| robots.txt | `src/app/robots.ts` | Libera buscadores, bloqueia scrapers de treino |
| sitemap.xml | `src/app/sitemap.ts` | Gerado automático |
| JSON-LD | `src/lib/jsonld.ts` | `@graph` com 5 schemas |
| Open Graph | `src/app/opengraph-image.tsx` | Card 1200×630 gerado no build |
| Metadata | `src/app/layout.tsx` | title, description, canonical, OG, Twitter |
| PWA | `src/app/manifest.ts` | Instalável, tema escuro |
| Headers | `next.config.ts` | HSTS, nosniff, Referrer-Policy, Permissions-Policy |

## Dados estruturados

`ProfessionalService` + `LocalBusiness` · `FAQPage` · `Person` · `WebSite` · `BreadcrumbList`

Inclui `geo`, `GeoCircle` com raio de atendimento, `areaServed` por cidade e um
`OfferCatalog` com 6 serviços.

**O `FAQPage` é o item mais valioso aqui.** As 6 perguntas viram dados estruturados
e podem fazer o site aparecer na busca **com o acordeão de perguntas aberto** —
ocupando mais tela que o resultado do concorrente. É a maior alavanca de SEO
disponível para uma página só.

## ⚠️ `NEXT_PUBLIC_SITE_URL` já derrubou um build

`layout.tsx` entrega esse valor ao `metadataBase`, que faz `new URL()`.
**`new URL()` não aceita domínio sem protocolo** — e domínio sem
protocolo é exatamente o que se digita num campo de painel:

```
NEXT_PUBLIC_SITE_URL=bigettefotosevideos.com.br
  → TypeError: Invalid URL   (ERR_INVALID_URL)
  → Failed to collect page data for /_not-found
  → Build error occurred
```

A mensagem aponta para `/_not-found` e **não diz qual variável foi**.
Pior: barra no fim passava sem reclamar. O formulário recusava um erro
de digitação e aceitava o outro, sem explicar nenhum dos dois.

Hoje `site.ts` **conserta** a entrada em vez de confiar nela — tira
espaço em volta e barra no fim, põe `https://` se faltar, e cai no
padrão se ainda assim não formar URL. Conferido com um build por forma:

| valor da variável | resolve para |
|---|---|
| não definida | `https://bigettefotosevideos.com.br` |
| `bigettefotosevideos.com.br` | `https://bigettefotosevideos.com.br` |
| `https://bigettefotosevideos.com.br/` | `https://bigettefotosevideos.com.br` |
| `␣␣https://bigettefotosevideos.com.br␣␣` | `https://bigettefotosevideos.com.br` |
| `:// nao url` | `https://bigettefotosevideos.com.br` |
| *(só `VERCEL_PROJECT_PRODUCTION_URL`)* | `https://lp-bigette.vercel.app` |

Nenhuma quebra o build. E a última linha é de propósito: sem nenhuma
variável configurada, a Vercel expõe `VERCEL_PROJECT_PRODUCTION_URL`
sozinha, então **um deploy novo já sai com o canonical certo**. Ela só
é lida no servidor — `site.url` não aparece em componente de cliente,
então servidor e navegador não têm como discordar.

## robots.txt — a política

```
LIBERADO:   Googlebot, Googlebot-Image, Bingbot
            OAI-SearchBot, PerplexityBot   (buscadores com IA — mandam tráfego de volta)

BLOQUEADO:  GPTBot, CCBot, ClaudeBot, anthropic-ai,
            Google-Extended, Applebot-Extended,
            Bytespider, meta-externalagent   (scrapers de treino)
```

Racional: as fotos são o ativo do negócio. Buscador que manda visitante de volta é
troca justa; scraper de treino não devolve nada.

## Performance — o que foi medido e corrigido

Tudo medido contra o build de PRODUÇÃO, em Pixel 7 emulado, rede 4G
(1,6 Mbps · 150 ms) e CPU estrangulada.

| | antes | depois |
|---|---|---|
| **LCP** | 3096 ms | **1096 ms** |
| fotos baixadas pela cena 3D | 1259 KB | **84 KB** |
| fontes no percurso todo | 293 KB | **175 KB** |
| fontes pré-carregadas | 293 KB | **95 KB** |
| CLS | 0,0001 | 0,0017 |
| TBT | 89 ms | 39 ms |

### 1. O LCP estava atrás do JavaScript inteiro

O elemento de LCP é o `<h1>` do hero, e ele vivia dentro de um
`<Reveal>` — que começa em `opacity: 0` e só aparece quando o
IntersectionObserver dispara. Ou seja: **o maior elemento da página
esperava o bundle baixar, interpretar e hidratar.**

Medido sem estrangular a CPU nenhuma vez: FCP 716 ms, LCP 3096 ms. A
diferença não era processamento, era espera de hidratação.

O hero está visível desde o primeiro quadro — não há o que observar.
Agora o `<Reveal>` aceita `imediato`, que troca a transição por um
**keyframe** e manda `data-shown="true"` já do servidor. Keyframe roda
assim que o CSS chega, sem JavaScript. Mesmo princípio do `foco-hero`
da foto, que já era assim.

Resultado: **LCP 1096 ms**, e segura em 1144 ms com CPU 4× estrangulada
— ou seja, deixou de ser um problema de espera.

> ⚠️ `imediato` é só para **acima da dobra**. Abaixo dela o observador
> é o certo: anima quando a pessoa chega, e não gasta nada antes.

### 2. A cena 3D baixava as fotos originais

As texturas dos prints são desenhadas num canvas de 300×375, e a cena
carregava o JPEG original — uns 2000 px e 250 KB cada. **1259 KB no
celular, mais que o JavaScript e as fontes somados**, e invisível para
qualquer auditoria: as fotos não passam por `<Image>`, então nenhuma
otimização do Next as alcançava.

Agora passam pelo otimizador (`/_next/image?w=384&q=75`). **84 KB**,
com os prints visualmente idênticos — conferido em captura.

### 3. Metade das fontes não era usada

`SOFT` e `WONK` eram declarados no `next/font` e **nunca variados** —
não existe um `font-variation-settings` em lugar nenhum do projeto.
Só engordavam o arquivo. `opsz` ficou, porque o navegador o aplica
sozinho por tamanho de fonte e removê-lo mudaria o desenho.

A itálica virou um segundo carregamento **sem pré-carga**: ela só
aparece nos gatilhos e nos depoimentos, a duas telas do topo, e
pré-carregar 66 KB que ninguém vê é competir com o `<h1>`.

> Use `font-display-italico italic`, não `font-display italic` — sem a
> família certa o navegador inclina a romana por conta própria, e
> oblíqua sintética não é o desenho da Fraunces itálica.

### O que NÃO foi feito, e por quê

**Sitemap de imagens.** É a forma canônica de mandar as fotos para o
Google Imagens, e faz falta: com a cena 3D ativa, só o hero fica como
`<img>` no DOM. Mas as fotos de hoje são do Unsplash — submeter um
sitemap de imagens agora é declarar ao Google que fotos de terceiros
são dela. Fica para quando as fotos reais entrarem; são ~10 linhas em
`src/app/sitemap.ts`.

## Checklist pós-deploy

- [ ] `NEXT_PUBLIC_SITE_URL` preenchido **com `https://` na frente**
- [ ] `seusite.com/robots.txt` abre
- [ ] `seusite.com/sitemap.xml` abre
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) — o FAQ é detectado?
- [ ] [Schema Validator](https://validator.schema.org/)
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] Colar o link no WhatsApp — o card aparece?
- [ ] Google Search Console → adicionar propriedade → enviar sitemap
- [ ] **Criar o Perfil da Empresa no Google** ← ver abaixo

## ⚠️ O Perfil da Empresa no Google vale mais que o site

Para negócio local de ticket baixo, o Perfil da Empresa costuma trazer mais cliente
que o site sozinho. Ele:
- aparece no Maps quando alguém busca "fotógrafo em [cidade]"
- **coleta avaliações** — a prova social que ela não tem
- é grátis e leva 1 hora

**Se fosse para fazer só uma coisa de aquisição, seria essa** — não o site.

## Analytics

Desligado por padrão. Se os IDs no `.env.local` ficarem vazios, nenhum script de
terceiro carrega.

**Menos o Speed Insights**, que fica sempre ligado (`<SpeedInsights />` em
`layout.tsx`, fora do `<Analytics />` porque não tem ID). Sem cookie, sem
consentimento, e na Vercel servido pelo próprio domínio. Ver D9.

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=000000000000
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

Todo clique em WhatsApp dispara `contato_whatsapp` com o nome da seção.
Ver `src/components/analytics/track.ts`.
