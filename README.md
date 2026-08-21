# Bigette Fotos e Vídeos — Landing Page

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4
Página única, mobile-first, sem preço, com **gatilho + CTA de WhatsApp ao fim de cada seção**.

---

## Rodar

```bash
npm install
cp .env.example .env.local     # preencha NEXT_PUBLIC_SITE_URL
npm run dev                    # http://localhost:3000
```

Build de produção:

```bash
npm run build && npm run start
```

### Mostrar no celular ou para o cliente (túnel)

O `next dev` **bloqueia origem estranha** nos recursos de `/_next/`. Por um
túnel, o HTML chega mas todo o JS e o CSS são recusados — e o sintoma é
"a página não renderiza nada", que parece erro do site e não é.

Os domínios de ngrok, cloudflared e localtunnel já estão liberados em
`allowedDevOrigins`, no `next.config.ts`. Para outro host:

```bash
NEXT_DEV_ORIGIN=seu.host.exemplo npm run dev
```

**Para mostrar para o cliente, prefira o build de produção** — não tem essa
restrição, não carrega o HMR e é o que ele vai ver de verdade:

```bash
npm run build && npm run start
ngrok http 3000
```

⚠️ O plano grátis do ngrok mostra uma tela de aviso antes do site
(`ERR_NGROK_6024`). É preciso clicar em **Visit Site** uma vez por navegador.
Quem não clica vê a tela do ngrok, não a página. Se isso incomodar,
`cloudflared tunnel --url http://localhost:3000` não tem essa tela.

---

## ⚠️ O que você PRECISA preencher

Tudo mora em **dois arquivos**. Você não precisa mexer em mais nada para o site ir ao ar.

### 1. `src/config/site.ts` — dados do negócio

Procure por `// ⚠️ PREENCHER`:

| Campo | Por que importa |
|---|---|
| `whatsapp.number` | **O mais crítico.** Todos os 11 CTAs apontam pra cá. Formato `5511999998888` |
| `city`, `state`, `region` | SEO local. Entra no `<title>`, no JSON-LD e no texto da página |
| `geo.lat/lng` | Faz o negócio aparecer no raio de busca do Google Maps |
| `areasAtendidas` | Vira `areaServed` no JSON-LD — cada cidade é uma chance de ranquear |
| `serviceRadiusKm` | Aparece no FAQ e no schema |
| `prazoEntregaDias` | Aparece no FAQ |
| `instagram`, `email` | Rodapé + `sameAs` no schema |
| `horarioAtendimento` | Aparece no CTA final |

### 2. `src/config/content.ts` — todo o texto

Cada seção tem um bloco `gatilho` com `frase` + `cta`. É a frase de efeito que fecha o bloco e o texto do botão. Mude à vontade.

### 3. As fotos

Coloque em `public/portfolio/` como `01.jpg` … `07.jpg`.
Depois abra `src/components/sections/Portfolio.tsx` e troque o `<Placeholder>` pelo `<Image>` — o código pronto está comentado ali dentro.

Os `alt` de cada foto já estão escritos em `content.ts`. **Não apague** — é o que faz as fotos aparecerem no Google Imagens.

Mesma coisa para o hero (`Hero.tsx`), o vídeo (`Video.tsx`) e a foto da Bigette (`Sobre.tsx`).

---

## SEO — o que já está pronto

| Recurso | Onde | O que faz |
|---|---|---|
| **robots.txt** | `src/app/robots.ts` | Libera Google/Bing e buscadores com IA. **Bloqueia scrapers de treino** (GPTBot, CCBot, ClaudeBot, Google-Extended, Bytespider…) — as fotos são o ativo dela |
| **sitemap.xml** | `src/app/sitemap.ts` | Gerado automático. Adicione rotas novas aqui |
| **JSON-LD** | `src/lib/jsonld.ts` | `ProfessionalService` + `LocalBusiness`, `FAQPage`, `Person`, `WebSite`, `BreadcrumbList`, `OfferCatalog` com 6 serviços |
| **Open Graph** | `src/app/opengraph-image.tsx` | Imagem 1200×630 gerada no build. É o card que aparece quando colam o link no WhatsApp |
| **Metadata** | `src/app/layout.tsx` | title/description, canonical, OG, Twitter card, `max-image-preview:large` |
| **PWA manifest** | `src/app/manifest.ts` | Instalável, tema escuro |
| **Headers** | `next.config.ts` | HSTS, nosniff, Referrer-Policy, Permissions-Policy, cache imutável nas fotos |
| **Fontes** | `layout.tsx` | `next/font` — self-hosted, zero layout shift, sem chamada ao Google |

### FAQPage é o mais valioso aqui
As 6 perguntas do FAQ viram dados estruturados. Isso pode fazer o site aparecer na busca **com o acordeão de perguntas aberto** — ocupa mais espaço na tela do que o resultado do concorrente.

### Verificar depois do deploy
- [Rich Results Test](https://search.google.com/test/rich-results) → cole a URL
- [Schema Validator](https://validator.schema.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- `seusite.com/robots.txt` e `/sitemap.xml` abrem?
- Cole o link no WhatsApp e veja se o card aparece

---

## Analytics — opcional e desligado por padrão

Se os IDs no `.env.local` ficarem **vazios, nenhum script de terceiro carrega**. A página fica mais rápida e você não precisa de banner de cookie.

Quando quiser ligar:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=000000000000
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

Todo clique em WhatsApp dispara o evento `contato_whatsapp` com o **nome da seção** (`hero`, `portfolio`, `faq`…). É assim que você descobre qual gatilho converte — sem isso, você só sabe que "alguém clicou".

**E tem um truque que funciona sem analytics nenhum:** a mensagem que abre no WhatsApp já vem com `(vim da seção: portfolio)` no final. Dá para rastrear lendo as próprias conversas.

---

## Estrutura

```
src/
├── app/
│   ├── layout.tsx              metadata + JSON-LD + fontes
│   ├── page.tsx                monta as 11 seções
│   ├── globals.css             tokens de cor e tipografia (Tailwind v4)
│   ├── robots.ts               /robots.txt
│   ├── sitemap.ts              /sitemap.xml
│   ├── manifest.ts             /manifest.webmanifest
│   └── opengraph-image.tsx     card social 1200×630
├── config/
│   ├── site.ts                 ⚠️ dados do negócio
│   └── content.ts              ⚠️ todo o texto
├── lib/
│   ├── jsonld.ts               dados estruturados
│   ├── whatsapp.ts             montagem dos links + rastreio
│   └── tokens.ts               {CIDADE} {PRAZO} {RAIO}
└── components/
    ├── sections/               as 11 seções + topbar/footer/float
    ├── ui/                     Gatilho, WhatsAppButton, Section, Placeholder
    └── analytics/              GA4 / Meta Pixel / GTM (env-gated)
```

---

## As 11 saídas para o WhatsApp

Barra fixa · Hero · Experiência · Portfólio · Depoimentos · Vídeo · Como funciona · Sobre · FAQ · CTA final · Botão flutuante.

Cada uma passa um `source` diferente. Não mexa nesses nomes sem querer — são a chave do relatório.

---

## Deploy

**Vercel** (mais simples): importe o repositório, adicione `NEXT_PUBLIC_SITE_URL` nas env vars, pronto.

Depois do primeiro deploy:
1. Google Search Console → adicionar propriedade → enviar o sitemap
2. **Criar o Perfil da Empresa no Google** — para negócio local isso costuma trazer mais cliente que o site sozinho
3. Colocar o link na bio do Instagram

---

## Acessibilidade

Skip link, foco visível, `aria-label` em todos os CTAs, `prefers-reduced-motion` respeitado, contraste conferido, HTML semântico (`header`/`main`/`section`/`article`/`figure`/`ol`).
