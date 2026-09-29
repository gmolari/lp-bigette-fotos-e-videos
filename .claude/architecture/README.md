# Arquitetura de código — backend e painel

> Specs de entrega ficam em `.claude/specs/NNN-nome.md`, numeradas em ordem.
> Design system em `.claude/design-system/`.
> Este arquivo descreve a ESTRUTURA; a spec descreve o QUE e o PORQUÊ de cada entrega.

## Convenções

- **Identificadores, arquivos, pastas e rotas em inglês.** Comentários em PT-BR.
- **Texto de interface** nunca no componente: LP em `src/config/content.ts`,
  painel em `src/config/panel-content.ts`.
- **Cliente → back SÓ por server action.** Sem route handler, sem `fetch` para dado próprio.
  Exceção única: `app/media/[...path]/route.ts` entrega ARQUIVO do Blob privado (spec 005).

## Camadas

```
src/
├── proxy.ts                  portão do painel + checagem otimista de sessão
├── app/                      entrega (Next.js)
│   └── (panel)/              painel escondido — layout com Providers e noindex
│       ├── login/
│       └── (area)/           exige sessão: pictures · profile · sections · users (admin)
├── modules/<module>/         um bounded context por pasta (DDD "leve")
│   ├── domain/               esquemas zod, tipos, portas (interfaces). Zero driver
│   ├── application/          casos de uso. Recebem as portas por parâmetro
│   ├── infrastructure/       implementa as portas (Drizzle, bcrypt) + schema.ts
│   ├── actions.ts            "use server" — server actions via createAction
│   └── index.ts              fachada server-only para Server Components
├── server/                   infraestrutura compartilhada, só servidor
│   ├── env.ts                serverEnv() — zod, validação preguiçosa
│   ├── action.ts             createAction() — a fábrica de toda server action
│   ├── errors.ts             classifyError() — exceção → código + mensagem segura
│   ├── log.ts                logError() — JSON em produção, legível em dev
│   ├── auth/jwt.ts           sign/verify do JWT { sub, ver } (jose). Sem server-only: o proxy usa
│   ├── auth/password.ts      bcrypt (custo 12)
│   ├── panel/gate.ts         portão do link especial (HMAC). Sem server-only: o proxy usa
│   └── db/                   client.ts · schema/index.ts · migrations/
├── lib/
│   ├── action/result.ts      Result<T>, DomainError, AccessError — cliente e servidor
│   ├── action/hooks.ts       useAction, useActionQuery, ActionError
│   └── form/useActionForm.ts zod + action + React Query num formulário
└── components/panel/         Providers, ui/, users/, motion/tokens.ts
```

### Módulos hoje

| Módulo | Contém |
|---|---|
| `users` | tabela `users` + enum `user_role`, repositório, perfil (dados/senha), admin (CRUD + regras do último admin) |
| `auth` | login (e-mail ou username), `guards.ts` (`getCurrentUser`, `requireUser`, `requireAdmin`, `requireGate`, sessão) |
| `sections` | tabela `section_pictures` + enum `page_section`: qual foto em qual seção e em que ordem. `section_videos`: link do YouTube por seção, validado no oEmbed (spec 007). Fachada `getPublishedSections()` com cache por tag, lida pela LP. Lê `pictures` direto no repositório (exceção consciente). Spec 006 |
| `pictures` | o BANCO de fotos: tabela `pictures`, upload no Vercel Blob (`infrastructure/blob.ts`), inspeção com sharp, ordem. `readPictureFile()` para a rota `/media`. Spec 005 |

`auth` depende de `users` (lê o repositório). `server/action.ts` importa os guards
de `modules/auth/guards.ts` — exceção consciente à direção das camadas.

## Regras de dependência

| Camada | Pode importar | Não pode |
|---|---|---|
| `domain` | zod, `panel-content` (mensagens) | drizzle, next, react, `@/server/*` |
| `application` | `domain` | `infrastructure`, `@/server/db` |
| `infrastructure` | `domain`, `@/server/db`, drizzle, bcrypt | `application`, `src/app` |
| `actions.ts` | tudo do módulo + `@/server/*` | — |
| `src/app` / componentes | `actions.ts`, `domain` (esquemas), `index.ts` do módulo | `infrastructure`, `@/server/db` |

Tudo que toca banco, cookie ou segredo começa com `import "server-only"` — o
build quebra se um componente de cliente puxar isso sem querer. Exceções
documentadas: `server/auth/jwt.ts` e `server/panel/gate.ts` (usados pelo proxy),
e `infrastructure/schema.ts` (lido pelo drizzle-kit e por scripts).

## Server actions — o fluxo inteiro

```
componente  ──useActionForm / useAction / useActionQuery──►  action (actions.ts)
                                                              │ createAction:
                                                              │  1. guard: requireSession / requireGate
                                                              │  2. zod safeParse
                                                              │  3. run(data, { session })
                                                              │  4. → Result<T>  (nunca lança)
componente  ◄──ActionError (code, fields) ou data─────────────┘
```

- **O mesmo esquema zod valida nos dois lados.** Mora em `domain/` (sem server-only).
- **Nunca lança para o cliente.** Toda falha vira `{ code, error, errorId?, detail? }`.
  Códigos, classificação de erros do Postgres e logs: **spec 004**
  (`src/server/errors.ts`, `src/server/log.ts`). Lance `DomainError` (regra),
  `FieldError` (campo), `AccessError`, `ConfigError`; o resto é classificado sozinho.
- **`createAction` exige `name`** (`"módulo.ação"`) — é o que identifica o erro no log.
- No cliente, mostre erro de action com **`<ActionAlert error={...} />`**, nunca
  `error.message` solto.
- **`guard`: `"user"` (padrão) · `"admin"` · `"gate"` · `"public"`.** Action é endpoint
  POST; o proxy não a protege. Só login/logout usam `"gate"`.
- **Sessão conferida no banco** a cada requisição (usuário existe, `session_version`
  bate, papel atual). O proxy só confere a assinatura do JWT — por isso **o proxy
  nunca redireciona para dentro**, só para fora (ver spec 003, loop de redirecionamento).
- `FieldError` (lib/action/result) → erro que aparece embaixo de um campo específico
  (ex.: e-mail já em uso, detectado pela constraint UNIQUE — nunca por checagem prévia).
- **Actions rodam em FILA por cliente** (despacho sequencial do Next). Não conte com
  paralelismo; uma tela com várias leituras deve juntar numa action só.
- React Query não refaz consulta ao focar a janela nem repete `ActionError`
  (erro de negócio não melhora tentando de novo). Ver `components/panel/Providers.tsx`.

## Receita: nova feature com tabela

1. `src/modules/<m>/infrastructure/schema.ts` — `pgTable(...).enableRLS()`.
   camelCase no TS; o `casing: "snake_case"` vira snake no banco.
2. Reexportar em `src/server/db/schema/index.ts` (**caminho relativo** — o drizzle-kit
   não resolve `@/`).
3. Esquema zod de entrada em `domain/`. O que sai para o cliente passa por uma
   função de mapeamento explícita (ex.: `toPublic`) — coluna nova não vaza sozinha (pode partir do `createInsertSchema` do `drizzle-zod`).
4. `npm run db:generate -- --name=<descricao>` → **ler o SQL** → commitar.
5. `npm run db:migrate` (PRODUÇÃO — não há homologação).
6. Porta em `domain`, caso de uso em `application`, repositório em `infrastructure`.
7. `actions.ts` com `createAction({ input })`, e no cliente `useActionForm` / `useActionQuery`.
8. Texto em `panel-content.ts`.

## ⚠️ Não há homologação

- **Nunca `db:push` em banco com dado.** Aplica diff sem migration e sem histórico.
- Migration destrutiva (drop/rename) em **dois passos**: código para de usar → deploy →
  migration remove.
- **RLS em toda tabela de `public`.** O Supabase expõe `public` pela API REST para a
  chave `anon`; sem RLS a tabela é legível por qualquer um que tenha essa chave.

## Conexão — por que assim

| Decisão | Motivo |
|---|---|
| Driver `postgres` (postgres.js) | Recomendado por Drizzle e Supabase para Node; pool embutido, sem binário nativo |
| Runtime no pooler **transação (6543)** | Serverless abre muitas instâncias; o Supavisor multiplexa em poucas conexões reais |
| `prepare: false` | Obrigatório no modo transação |
| drizzle-kit no pooler **sessão (5432)** | Migration precisa de sessão estável |
| Não usar `db.<ref>.supabase.co` | Só IPv6 no plano grátis |
| Singleton em `globalThis` | Hot reload criaria um pool por salvamento |
| `max` 5, `idle_timeout` 20 s, `max_lifetime` 30 min, `connect_timeout` 10 s | Instância congelada não segura conexão; falha rápido |
