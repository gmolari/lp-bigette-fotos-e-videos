# Spec 004 — Tratamento de erros

**Status:** ✅ entregue em 26/09/2026 · depende da 002/003

## O que motivou

O login mostrava só "Algo deu errado do nosso lado", e o log do servidor
guardava só a mensagem, sem pilha: `TypeError: Cannot read properties of
undefined (reading 'replace')`. Não havia como saber a causa.

**Causa provável** (não provada — faltava a pilha): o `next dev` estava de pé
desde antes de a tabela `users` mudar de pasta e ganhar `username`; o Turbopack
manteve o schema antigo em cache, e o Drizzle quebra com exatamente esse erro ao
converter para snake_case uma coluna que não existe no schema carregado.
**Reiniciar o `next dev` resolveu.** Depois de mexer em schema/migration, reinicie.

## Princípio

Toda falha tem um **código** que diz o que aconteceu e uma **mensagem segura**.
Detalhe técnico nunca vai ao navegador em produção; vai ao log, achável por um
**`errorId`** que aparece na tela.

## Códigos (`src/lib/action/result.ts`)

| Código | Quando | Logado? | Mensagem |
|---|---|---|---|
| `VALIDATION` | zod reprovou / constraint mapeada (e-mail em uso) | não | embaixo de cada campo |
| `DOMAIN` | regra de negócio (`DomainError`) | não | a própria regra |
| `UNAUTHENTICATED` | sem sessão / sessão morta | não | "Sua sessão expirou…" → **vai para /login sozinho** |
| `FORBIDDEN` | papel não permite | não | "Você não tem permissão…" |
| `CONFLICT` | 23505/23503 não mapeados | sim | "Já existe um registro…" |
| `INVALID_DATA` | 22xxx, 23502, 23514 | sim | "…formato inválido" |
| `UNAVAILABLE` | rede até o banco, 08xxx, 53300, 57P0x | sim | "Não conseguimos falar com o banco…" |
| `TIMEOUT` | 57014 | sim | "…demorou demais" |
| `UPSTREAM` | `UpstreamError` — serviço externo (Vercel Blob) caiu, recusou ou limitou. Checado ANTES dos códigos de rede. Entrou na spec 005 | sim | "O serviço de imagens não respondeu…" ou `userMessage` |
| `CONFIG` | `ConfigError` (env/segredo), 28P01, 28000, 3D000, 42501 | sim | "…configuração incompleta ou inválida" |
| `SCHEMA` | 42P01, 42703, 42704, 42883 — migration pendente | sim | "…banco desatualizado" |
| `INTERNAL` | qualquer outra coisa (bug) | sim | "Algo deu errado do nosso lado…" |
| `NETWORK` | *cliente*: fetch rejeitou / offline | — | "Sem conexão com o servidor…" |
| `STALE` | *cliente*: deploy novo, action sumiu | — | "O painel foi atualizado…" + botão Recarregar |

## Como flui

```
servidor  createAction ──catch──► toFailure()
            FieldError / DomainError / AccessError  → código direto, sem log
            resto → classifyError() (desce a cadeia de `cause` do Drizzle até o SQLSTATE)
                  → errorId + logError()  → { code, error, errorId, detail? }
                                                               └ só em dev
cliente   unwrap() ── promessa rejeitou? ──► ActionError.fromTransport → NETWORK / STALE
                 └─ { ok:false } ─────────► ActionError(code, fields, errorId, detail)
          QueryClient onError: UNAUTHENTICATED → router.replace("/login")
          retry automático só em NETWORK / UNAVAILABLE / TIMEOUT / UPSTREAM (consultas; mutação nunca)
          <ActionAlert error={…}> mostra mensagem, errorId, detalhe (dev), botão (STALE)
render    error.tsx em (panel) e (panel)/(area) → <ErrorScreen> com o `digest` do Next
```

- `createAction` agora exige **`name`** (ex.: `"users.update"`) — vai no log.
- `ConfigError` lançado por `serverEnv()` e pelo JWT (segredo ausente).
- `AccessError("forbidden")` separado de `AccessError()` (não autenticado).
- `ActionAlert` esconde `VALIDATION` com campos — o erro já está no campo.
- Botão Sair mostra o erro se falhar (antes falhava calado).

## Logs

| Ambiente | Formato |
|---|---|
| produção | 1 linha JSON: `level, errorId, action, code, cause, sqlstate, stack` — buscável por `errorId` nos logs da Vercel |
| desenvolvimento | bloco legível: `[server action] auth.signIn → CONFIG (errorId …)`, causa e pilha completa |

## Verificação (build de produção, ambiente sabotado de propósito)

| Cenário | Código recebido |
|---|---|
| senha errada | `DOMAIN` |
| membro chama action de admin | `FORBIDDEN` |
| sessão morta (session_version mudou) | `UNAUTHENTICATED` |
| senha do banco errada | `CONFIG` + errorId |
| banco inalcançável (127.0.0.1:1) | `UNAVAILABLE` + errorId |
| `AUTH_JWT_SECRET` vazio | `CONFIG` + errorId |
| `DATABASE_POSTGRES_URL` vazio | `CONFIG` + errorId |
| em produção, `detail` na resposta? | não |
| log de produção | linha JSON com causa, SQLSTATE e pilha |

Classificação conferida também com erros sintéticos no formato real (inclusive
embrulhados em `DrizzleQueryError`) para SCHEMA, TIMEOUT, CONFLICT, INVALID_DATA.

## Não verificado

- `NETWORK` e `STALE` no navegador (lógica do cliente; não há navegador neste WSL).
- `detail` aparecendo na tela em `npm run dev` — conferir de olho.
- `error.tsx` disparando de verdade (nenhum erro de renderização provocado).
