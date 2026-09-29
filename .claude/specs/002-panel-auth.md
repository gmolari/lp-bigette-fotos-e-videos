# Spec 002 — Painel escondido, autenticação JWT e server actions + React Query

**Status:** ✅ entregue em 26/09/2026 · depende da 001

## Objetivo

1. Estabelecer o padrão **cliente → back só por server action**, com zod + Drizzle + React Query.
2. Criar o painel: `/login`, `/pictures`, `/profile`, `/sections` — **escondidos**.
3. Autenticação com **JWT** em cookie httpOnly, senha com **bcrypt**.
4. Remover `/status/db` (pedido do usuário).
5. Especificar o design system do painel (`.claude/design-system/`).

`/pictures`, `/profile` e `/sections` ficam com estado vazio — o usuário
ainda vai definir o que cada uma faz.

## Pacotes

| Pacote | Papel |
|---|---|
| `@tanstack/react-query` (+ devtools, dev) | estado de servidor no cliente |
| `jose` | JWT (HS256). Ver "Por que jose" |
| `bcrypt` (+ `@types/bcrypt`) | hash de senha, custo 12 |
| `motion` | animações (é o Framer Motion renomeado: `import { m } from "motion/react"`) |
| `tsx` (dev) | roda `scripts/create-user.ts` |

### Por que `jose` e não `jsonwebtoken`

O pedido foi "jwttoken". O JWT é o mesmo padrão; a biblioteca muda porque o
token é verificado **também no `proxy.ts`**, e `jose` usa Web Crypto — roda em
qualquer runtime, é ESM e assíncrona. `jsonwebtoken` é CommonJS, depende de
`node:crypto` e é a opção que a própria documentação do Next não usa.
Trocar é mexer em um arquivo: `src/server/auth/jwt.ts`.

## Variáveis novas

| Variável | Uso |
|---|---|
| `PANEL_ACCESS_KEY` | chave do link especial, ≥ 32 caracteres. Sem ela, o painel é 404 |
| `AUTH_JWT_SECRET` | segredo HS256, ≥ 32 caracteres. Trocar desloga todos |

As duas já estão no `.env` local. **Precisam ir para o painel da Vercel**
(Production), senão o painel não existe em produção — é o comportamento seguro.

## Como o painel fica escondido

```
sem cookie do portão          → 404 padrão (idêntico a URL inventada)
/login?access=<chave errada>  → 404
/login?access=<chave certa>   → cookie bgt_gate (HMAC da chave, 30 dias) + redirect p/ /login limpo
portão ok, sem sessão         → páginas internas redirecionam p/ /login
portão ok, com sessão         → /login redireciona p/ /pictures
```

- Todas as respostas levam `X-Robots-Tag: noindex, nofollow, noarchive` e
  `Cache-Control: private, no-store`; o layout do painel põe meta `robots` noindex
  e remove o canonical/OG herdados da LP.
- **Nada no sitemap nem no robots.txt.** `Disallow: /login` anunciaria o painel.
- Texto do painel em `panel-content.ts`: conferido que **nenhuma string, cookie
  ou React Query** aparece nos chunks JS da landing page.

## Autenticação

- Tabela `users` (migration `0001_create_users`): `id uuid`, `email` único,
  `password_hash`, `name`, `last_login_at`, `created_at`, `updated_at`. **RLS ligado,
  sem política** → a API REST do Supabase não lê nada; nossa conexão (`postgres`) sim.
- Sem cadastro na interface. Usuário é criado por terminal:
  `npm run user:create -- email@dominio.com` (senha pedida sem eco; rodar de novo troca a senha).
- JWT HS256 com `sub` (id), `email`, `iss`/`aud` fixos, 7 dias, algoritmo fixado na verificação.
- Cookie `bgt_session`: httpOnly, `secure` em produção, `sameSite: lax`.
- Login nunca diz se o erro foi o e-mail ou a senha, e compara contra um hash
  bcrypt falso quando o e-mail não existe — **medido: 0,461 s vs 0,455 s**.
- Verificação em 3 camadas: proxy (otimista) → layout `(area)` (`getSession`) →
  cada action (`createAction`, guard `"session"` por padrão).

## Verificação (build de produção, `next start`)

| Caso | Resultado |
|---|---|
| `/login` sem cookie | 404 + X-Robots-Tag |
| chave errada / `/pictures` sem cookie | 404 |
| link com chave certa | 307 → `/login`, cookie httpOnly |
| `/pictures` com portão, sem sessão | 307 → `/login` |
| action: entrada inválida | `VALIDATION` com erros por campo |
| action: senha errada / e-mail inexistente | `DOMAIN` "E-mail ou senha incorretos." nos dois |
| action: login com `"  E2E-teste@… "` | ok (e-mail normalizado pelo zod) + cookie de sessão |
| `/pictures`, `/profile` logado | 200, perfil mostra o e-mail |
| JWT com assinatura adulterada | 307 → `/login` |
| signOut | cookie apagado, `/pictures` → `/login` |
| action chamada em `/` | 404 "Server action not found" (Next 16 escopa por rota) |
| `/`, sitemap, robots.txt | LP 200; zero menções ao painel |

Usuário de teste criado para isso foi **apagado** ao final.

## Não verificado

- **Interface no navegador** (animações, foco, tremida do erro). O Chromium headless
  não sobe neste WSL — faltam bibliotecas do sistema (`libatk`), e instalar pede sudo.
  Os fluxos foram conferidos por HTTP, não de olho.
- Caminho `ACCESS` de uma action com guard `"session"` — ainda não existe nenhuma.
- Produção na Vercel.

## Pendências conhecidas

- **Sem rate limit no login.** O portão já esconde a rota e o bcrypt custa ~250 ms
  por tentativa, mas vale limitar por IP quando o painel ganhar dado de valor.
- **Sem revogação de JWT** além de trocar `AUTH_JWT_SECRET` (desloga todos). Para
  um painel de uma pessoa, suficiente.
- Código da LP continua com identificadores em PT; renomear só se pedido.
