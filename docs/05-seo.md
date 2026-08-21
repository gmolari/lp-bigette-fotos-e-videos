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
NEXT_PUBLIC_SITE_URL=bigette.com.br
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
| não definida | `https://bigette.com.br` |
| `bigette.com.br` | `https://bigette.com.br` |
| `https://bigette.com.br/` | `https://bigette.com.br` |
| `␣␣https://bigette.com.br␣␣` | `https://bigette.com.br` |
| `:// nao url` | `https://bigette.com.br` |
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

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=000000000000
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

Todo clique em WhatsApp dispara `contato_whatsapp` com o nome da seção.
Ver `src/components/analytics/track.ts`.
