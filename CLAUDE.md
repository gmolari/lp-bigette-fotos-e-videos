# Bigette Fotos e Vídeos — Landing Page

Landing page de página única para uma fotógrafa brasileira **iniciante**.
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4.

---

## Leia antes de propor qualquer coisa

Contexto do negócio (ticket, volume, gargalo): @docs/00-contexto-negocio.md
Decisões tomadas e o que as reverteria: @docs/03-decisoes.md
Erros já cometidos — **não reintroduzir**: @docs/99-historico-erros.md
Pendências que travam o projeto: @docs/06-pendencias.md

Paleta e tipografia, com as contas: @docs/08-paleta.md
Movimento e 3D, com as armadilhas: @docs/09-movimento-3d.md

Referências verificadas: @docs/01-pesquisa-referencias.md
Análise econômica com as contas: @docs/02-analise-economica.md
Estrutura da página e os 11 gatilhos: @docs/04-estrutura-lp.md
SEO implementado e checklist: @docs/05-seo.md
Como o projeto chegou aqui: @docs/07-conversa-original.md

---

## Os 6 fatos que governam tudo

1. **Ticket R$ 200–800.** Não é fotografia de casamento de ticket alto. Qualquer
   recomendação que assuma R$ 4.000+ está errada por uma ordem de grandeza.
2. **8 sessões realizadas, ~500 seguidores, iniciante.** Sem autoridade a alegar,
   sem portfólio grande, sem depoimentos formais.
3. **O gargalo é volume, não capacidade.** Ocupação de 8–17%. A alavanca é volume →
   portfólio → prova social → preço, nessa ordem.
4. **A página não é destino de tráfego pago.** É link da bio, link no WhatsApp e
   busca pelo nome — 30 a 100 visitas/mês. Função: responder e destravar, não persuadir.
5. **Sem preço na página.** Decisão do cliente. A pergunta "quanto custa" é o
   primeiro item do FAQ e leva pro WhatsApp.
6. **O negócio se chama "Fotos e Vídeos"** e ainda não sabemos se ela filma.
   É a pendência de maior valor econômico do projeto.

## Regras de trabalho

- **Toda referência precisa ser aberta antes de citada.** Se não abrir, escreva
  INACESSÍVEL e não use. Este projeto já foi contaminado uma vez por descrição de
  segunda mão — ver `docs/99-historico-erros.md`.
- **Nunca desenhe um layout que você não observou.** Um artefato visual vira
  evidência aos olhos de quem o vê depois, por mais que haja ressalva escrita.
- Texto e conteúdo **sempre** em `src/config/content.ts`. Nunca hardcode string em componente.
- Dados de negócio **sempre** em `src/config/site.ts`.
- Todo CTA de WhatsApp passa por `<WhatsAppButton source="...">`. **Não altere os
  valores de `source`** — são a chave do relatório de conversão.
- Português do Brasil em todo texto de interface, comentário e commit.

## Comandos

```bash
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint
npm run db:generate   # migration a partir do schema
npm run db:migrate    # ⚠️ aplica em PRODUÇÃO — não há homologação
npm run db:studio
npm run user:create -- <email> <username> [--admin] [--name "Nome"]   # 1º admin / trocar senha
```

## Backend — banco de dados

Supabase (Postgres) + Drizzle ORM + postgres.js + zod + React Query, em módulos DDD.
**Leia antes de mexer:**
- `.claude/architecture/README.md` — estrutura, regras de dependência, receita de feature
- `.claude/specs/` — uma spec por entrega, numeradas
- `.claude/design-system/` — tokens, componentes, estados e movimento (painel)

Regras que não se negociam:
- **Cliente → back só por server action**, criada com `createAction({ name, input, guard })`
  (`src/server/action.ts`) e consumida com `useAction` / `useActionQuery` / `useActionForm`.
  Nada de route handler para dado próprio.
- **Erro de action na tela só via `<ActionAlert>`.** Códigos e mensagens: spec 004.
- **Mexeu em schema/migration com `npm run dev` aberto? Reinicie o dev.** O Turbopack
  guarda o schema antigo e o erro que sai não aponta para isso (spec 004).
- **Identificadores, arquivos e pastas em inglês.** Comentários podem ser PT-BR.
  (O código legado da LP — `Gatilho`, `content.sala`… — segue em PT até alguém pedir o contrário.)
- **Toda tabela nova em `public` leva `.enableRLS()`** — senão a chave `anon` do Supabase lê a tabela.
- **Painel escondido:** `/login`, `/pictures`, `/profile`, `/sections`, `/users` só existem via
  `/login?access=<PANEL_ACCESS_KEY>`. Nunca listar no sitemap nem no robots.txt.
  Rota nova do painel → adicionar ao `matcher` de `src/proxy.ts`.
- **Papéis:** `admin` (tudo, inclusive `/users`) e `member`. Sessão é conferida NO BANCO
  a cada requisição; o proxy só vê o JWT e por isso **nunca redireciona para dentro**.
- Texto do painel em `src/config/panel-content.ts` (fora do pacote da LP), não em `content.ts`.

## Arquitetura

```
src/
├── app/
│   ├── layout.tsx            metadata completa + JSON-LD + next/font
│   ├── page.tsx              monta as 11 seções na ordem
│   ├── globals.css           tokens (Tailwind v4, bloco @theme)
│   ├── robots.ts             bloqueia scrapers de treino, libera buscadores
│   ├── sitemap.ts
│   ├── manifest.ts
│   └── opengraph-image.tsx   card social 1200×630 gerado no build
├── config/
│   ├── site.ts               ⚠️ dados do negócio — tem // ⚠️ PREENCHER
│   └── content.ts            ⚠️ todo o texto, incluindo os gatilhos
├── lib/
│   ├── jsonld.ts             LocalBusiness, FAQPage, Person, WebSite, Breadcrumb
│   ├── whatsapp.ts           montagem dos links + rastreio por seção
│   └── tokens.ts             {CIDADE} {PRAZO} {RAIO}
├── app/(panel)/            painel escondido: login + (area)/pictures (banco) | sections (onde cada foto aparece) | profile
├── lib/portfolio.ts        fotos de cada seção lidas NO SERVIDOR (cache por tag) → Hero/Sala/CtaFinal/cena 3D
├── proxy.ts                portão do painel (404 sem o link) + checagem de sessão
├── modules/<module>/       DDD: domain · application · infrastructure · actions.ts · index.ts
├── server/                 env.ts · action.ts (fábrica) · auth/ (JWT) · panel/ (portão) · db/
├── lib/action · lib/form   Result, hooks React Query, useActionForm
├── components/panel/       UI do painel: ui/ (Button, Field, Alert…) · motion/tokens.ts
└── components/
    ├── sections/             11 seções + TopBar/Footer/WhatsAppFloat
    ├── ui/                   Gatilho, WhatsAppButton, Section, Placeholder
    └── analytics/            GA4 / Meta Pixel / GTM — desligados sem env var
```

## O padrão central: gatilho por seção

Cada seção fecha com `<Gatilho frase="..." cta="..." source="..." />` — frase de
efeito + botão de WhatsApp. São **11 saídas**, todas para o mesmo destino.

Ao adicionar uma seção nova, ela precisa de um gatilho. É o padrão do projeto.

## Estado atual

✅ Build passa, lint limpo, SEO completo, 11 CTAs apontando para o número real
✅ Londrina/PR · WhatsApp e Instagram reais confirmados
🔒 **Contato real fora do repositório.** `site.ts` traz `5500000000000` e
   `seu_instagram` como placeholder — preencha os dois antes de deployar
✅ Paleta lilás derivada em OKLCH, 13/13 pares passam em WCAG AA — `docs/08-paleta.md`
✅ Cena 3D em duas seções, **inclusive no celular**, com enquadramento
   próprio em retrato e o chunk (130 KB) baixado só perto da seção.
   O portão de 900px caiu — ver `docs/09-movimento-3d.md`
✅ **Fotos: banco de imagens em `/pictures` (Vercel Blob privado), spec 005.**
✅ **Seções em `/sections`: banner (1), cordel (7) e polaroides (12), spec 006.**
   Repetição só a partir de 4; abaixo disso completa com as provisórias.
✅ **Sobre (1 foto) e Vídeo (link do YouTube + capa), spec 007** — inventário de toda
   mídia da página com proporções. Migration `0005` aplicada em 29/09/2026.
   ⛔ Imgur foi descartado: fechou o registro de apps novos (ver spec 005).
   Seção vazia → a LP mostra as provisórias do Unsplash (`public/portfolio/CREDITOS.txt`).
   Sobre e Vídeo vazios → espaço reservado (nunca um rosto qualquer).
🔴 **Os 4 depoimentos são inventados e dois foram copiados de concorrente.**
   Marcado em `content.ts`. Não subir a página com eles.
🟡 `serviceRadiusKm` (50 km) e `prazoEntregaDias` (10) são suposições — confirmar

## Figma — são dois arquivos, e só um presta

### ✅ Design System (use este)
`figma.com/design/Jt8Q05pQXEz4XhwKVu1gFz` — **Bigette — Design System (lilás)**

Paleta com as 16 variáveis, as relações de teoria das cores, a tabela de
contraste e os espécimes tipográficos. **Documenta o que ESTÁ no código.**
Se divergir, o código está certo e o Figma está velho.
As contas estão em `docs/08-paleta.md`.

### ⛔ LP - Bigette Fotos e Videos (não use)
`figma.com/design/x8HmXnVlnUUtYZVbnpuFHt` contém a pesquisa **v1, que foi
invalidada** — incluindo 12 esqueletos de layout que são ficção. **Não use como fonte.**
A pesquisa correta é `docs/01-pesquisa-referencias.md`. Detalhes em `docs/99-historico-erros.md`.
