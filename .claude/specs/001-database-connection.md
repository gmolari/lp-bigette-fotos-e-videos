# Spec 001 — Conexão com o banco (Supabase + Drizzle)

**Status:** ✅ entregue em 26/09/2026 · **Arquitetura:** `.claude/architecture/README.md`

> 🔄 **Atualizado na spec 002 (26/09/2026):** a página `/status/db` e o módulo
> `diagnostico` foram **removidos** a pedido do usuário, e todo identificador
> passou para inglês (`envServidor` → `serverEnv`, `configPool` saiu). O que
> está abaixo sobre a página fica como registro da verificação feita.

## Objetivo

Ligar a aplicação ao Postgres do Supabase com Drizzle ORM, sem nenhuma tabela
de negócio ainda: conexão, pool, validação de env, migrations e uma página que
prova que tudo funciona.

## Fora do escopo

Tabelas de negócio · supabase-js · Auth/Storage/RLS · chaves `anon`/`service_role`.
Nada disso é usado — o acesso é Postgres puro via Drizzle. As chaves do Supabase
ficaram de fora do `.env` de propósito: segredo que não é usado é só superfície.

## Stack

| Pacote | Papel |
|---|---|
| `drizzle-orm` | ORM / query builder |
| `postgres` | driver (postgres.js) |
| `drizzle-kit` (dev) | generate / migrate / studio |
| `zod` | validação de env (e, adiante, de entrada) |
| `drizzle-zod` | gera schema zod a partir das tabelas (pronto para a 1ª tabela) |
| `server-only` | impede import do banco em componente de cliente |

## Variáveis

| Variável | Usada por | Valor |
|---|---|---|
| `DATABASE_POSTGRES_URL` | runtime | pooler **transação** `:6543`, `sslmode=require` |
| `DATABASE_POSTGRES_URL_NON_POOLING` | drizzle-kit | pooler **sessão** `:5432`, `sslmode=require` |
| `DB_POOL_MAX` | runtime (opcional) | padrão 5, faixa 1–20 |

Nomes iguais aos que a integração Supabase ↔ Vercel injeta → sem renomear em produção.
Reais em `.env` (git-ignorado); `.env.example` só tem o formato.

Removidos da URL de runtime em relação ao que o Supabase entrega:
`pgbouncer=true` e `supa=base-pooler.x` — o postgres.js repassa parâmetro
desconhecido da query string como parâmetro de sessão ao servidor.

## Arquivos

```
drizzle.config.ts                                    config do drizzle-kit (lê .env via @next/env)
src/server/env.ts                                    zod, validação preguiçosa → serverEnv()
src/server/db/client.ts                              getDb()
src/server/db/schema/index.ts                        ponto de reexport das tabelas dos módulos
src/server/db/migrations/0000_init.sql               migration vazia (prova do encanamento)
(removidos na spec 002: módulo diagnostico, /status/db e seus textos)
```

## Scripts

```bash
npm run db:generate   # gera migration a partir do schema
npm run db:migrate    # aplica migrations pendentes  ⚠️ PRODUÇÃO
npm run db:check      # consistência das migrations
npm run db:studio     # UI do banco
npm run db:pull       # introspecção (schema a partir do banco)
npm run db:push       # ⛔ só protótipo — sem migration, sem histórico
```

Migrations **não** rodam no build da Vercel. Aplicar é passo manual e
consciente, antes do deploy do código que depende delas.

## `/status/db` (removida na spec 002)

Dinâmica (`await connection()`), `noindex, nofollow`, não linkada nem no sitemap.
Mostra: status (verde / ouro se > 500 ms / vermelho), latência, versão do
Postgres, banco, usuário, hora e fuso do servidor, tamanho, uptime,
conexões ativas/máximo, tabelas em `public`, migrations aplicadas e a config
do pool. Nunca mostra senha nem URL completa — só o host do pooler.

Falha de conexão ou env ausente vira tela "DB not connected" com a mensagem
e o código do erro — não derruba a página.

> ⚠️ Está pública. Expõe versão do Postgres e contagem de conexões — baixo
> risco, mas se incomodar, proteger por token ou apagar a rota.

## Verificação (26/09/2026, contra `npm run build && npm run start`)

```
db:migrate  → 0000_init aplicada (cria drizzle.__drizzle_migrations)
db:check    → Everything's fine
build       → /status/db = ƒ (dinâmica); resto continua estático
/status/db  → DB Connected · PostgreSQL 17.6 · migrations 1 · pool 5 · modo transação
latência    → 1655 ms a frio (TLS + pooler), depois 310 / 380 ms
```

A latência quente (~300 ms) são duas idas ao `us-east-1` a partir do Brasil.
Na Vercel, com a função na mesma região do banco (`iad1`), deve cair para
um dígito. **Conferir a região da função no painel** — se ficar em `gru1`,
cada query atravessa o continente.

Caminho de falha, com senha errada:

```
/status/db  → DB not connected · "password authentication failed for user "postgres"" · 28P01
```

> ⚠️ O Drizzle embrulha o erro do driver num `DrizzleQueryError` cuja mensagem
> é só `Failed query: select ...`. A primeira versão mostrava isso — inútil.
> O caso de uso desce pela cadeia de `cause` até o erro do postgres.js.

## Não testado

- Env ausente (`ENV_INVALIDA`) — só por leitura.
- Comportamento na Vercel (Fluid compute, região) — só local.
