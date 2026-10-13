# Spec 009 — Access token de 15 min + refresh token de 7 dias com rotação

**Status:** ✅ entregue em 13/10/2026 · migration `0007` aplicada · substitui a sessão da spec 002

## Pedido

"O JWT não está seguro": JWT de 15 min, refresh de 7 dias, e a cada refresh criar um novo — fluxo seguro.

## O que havia, e o que estava errado

Um único JWT de **7 dias** no cookie `bgt_session`, conferido no banco a cada requisição
(`users.session_version`). O que isso deixava aberto:

| Problema | Consequência |
|---|---|
| **Logout só apagava o cookie** | Um token copiado antes do logout valia até completar 7 dias |
| Sem sessão por aparelho | Único jeito de derrubar alguém era trocar a senha (derruba todos) ou o `AUTH_JWT_SECRET` |
| Token de vida longa | Qualquer vazamento valia uma semana |
| Roubo indetectável | Dois usos do mesmo token são indistinguíveis |

O que **já estava certo e ficou**: HS256 com algoritmo fixado, `iss`/`aud`, segredo ≥ 32, cookie
httpOnly/secure/sameSite, papel e versão lidos do banco, login em tempo constante.

## O fluxo

```
LOGIN      senha ok → linha em auth_sessions (sid) → 2 cookies httpOnly:
             bgt_session  JWT { sub, ver, sid }, 15 min
             bgt_refresh  "<sid>.<256 bits aleatórios>", 7 dias — o banco guarda só o SHA-256

REQUISIÇÃO access válido            → segue (a página/action ainda confere no banco)
           access vencido ou ausente → o PROXY troca o refresh:
               UPDATE atômico: hash atual vira o anterior, entra um novo, +7 dias
               → cookies novos na resposta E access novo na requisição em curso

REFRESH    é de USO ÚNICO. O apresentado deixa de valer na hora.

LOGOUT     revoga a linha no banco, depois apaga os cookies
```

- **Refresh opaco, não JWT.** Ele precisa do banco de qualquer jeito (uso único, revogação); um
  segredo aleatório é mais simples e não carrega nada legível.
- **A renovação mora no `proxy.ts`** porque Server Component não grava cookie. O proxy do Next 16
  roda em Node e alcança o banco; ele reescreve o cabeçalho `cookie` da requisição
  (`NextResponse.next({ request })`) para a página e a action já lerem o access novo.
- **7 dias deslizantes, teto de 30.** Cada renovação dá mais 7 dias; `absolute_expires_at`
  (login + 30 dias) limita no próprio UPDATE (`least(...)`). Decisão minha — o pedido só dizia 7 dias.
  É uma constante: `SESSION_ABSOLUTE_MAX_AGE` em `server/auth/refresh-token.ts`.

## Reuso × corrida

Token já usado que reaparece pode ser roubo — ou só o mesmo navegador em duas requisições
simultâneas (duas abas, navegação + prefetch), que saem com o mesmo cookie.

| O que chega | Desfecho |
|---|---|
| hash em vigor | **rotaciona** |
| hash ANTERIOR, trocado há ≤ 30 s (`REFRESH_GRACE_SECONDS`) | **corrida**: access novo, sem refresh novo (a outra resposta já gravou) |
| hash anterior fora da janela, ou qualquer outro para um `sid` real | **reuso**: a sessão INTEIRA é revogada (`reuse`) e os dois lados voltam ao login. Fica no log (`auth.refresh.reuse`) |
| hash em vigor, mas `users.session_version` mudou | `stale`: senha foi trocada. Revoga |
| vencido · revogado · `sid` desconhecido · fora do formato | recusado, cookies apagados |

⚠️ Custo conhecido da janela: quem roubar um refresh e usá-lo em até 30 s depois do dono ganha
**um** access de 15 min, sem refresh. E o contrário: se a resposta da troca se perder na rede, o
navegador fica com o token velho e, passada a janela, cai em "reuso" — login de novo.

## O access token continua conferido no banco

`getCurrentUser` agora confere, em paralelo, o usuário (existe, `session_version` bate) **e a
sessão** (`isActive`: é dele, não revogada, não vencida). É isso que faz logout e revogação por
reuso valerem **na hora**, e não em até 15 minutos.

## Banco — migration `0007_auth_sessions`

`auth_sessions`: `id` (= `sid`), `user_id` → users ON DELETE CASCADE, `session_version`,
`token_hash`, `previous_token_hash`, `rotated_at`, `expires_at`, `absolute_expires_at`,
`revoked_at`, `revoked_reason` (`logout` · `replaced` · `reuse` · `stale`), `created_at`.
Índice em `user_id`. **RLS ligado, sem política.** Uma linha por sessão — o token gira dentro dela.

Limpeza: no login, apaga as sessões do usuário vencidas ou revogadas há mais de 7 dias (não há cron).

`modules/auth/infrastructure/schema.ts` tinha uma cópia morta da tabela `users` da spec 002,
que ninguém importava; virou a casa de `auth_sessions`.

## Outras mudanças

- **Server action sem sessão não é mais redirecionada pelo proxy.** O 307 num POST de action virava
  erro de transporte no cliente; agora a action passa, o guard responde `UNAUTHENTICATED` e o
  `Providers.tsx` leva ao login.
- `startSession` encerra a sessão anterior do navegador (`replaced`) — login novo ou troca de senha.
- Banco fora do ar durante a renovação **não** apaga os cookies (a sessão pode estar boa).
- **Quem estava logado precisa entrar de novo** uma vez: o JWT antigo não tem `sid`.

## Arquivos

| | |
|---|---|
| `server/auth/jwt.ts` | access token (15 min, `sid`) |
| `server/auth/refresh-token.ts` | gerar, hashear e ler o refresh; os três prazos |
| `server/auth/cookies.ts` | os dois cookies, gravados igual por action e proxy |
| `modules/auth/application/sessions.ts` | `openSession` · `rotateSession` · `closeSession` — a regra, sem cookie |
| `modules/auth/infrastructure/session-repository.ts` | o UPDATE atômico da rotação |
| `modules/auth/refresh.ts` | o que o proxy chama |
| `modules/auth/guards.ts` · `proxy.ts` | onde os cookies são gravados |

## Verificação

**Regra (repositório em memória, relógio controlado) — 21 de 21:** rotação · corrida a 5 s · reuso a
65 s revoga tudo, inclusive o token legítimo e o access · token de 2 gerações atrás · segredo inventado
para `sid` real · 7 dias sem uso · renovando todo dia morre no teto de 30 (29 renovações) · senha trocada
· logout · 6 formas malformadas · access com `exp − iat = 900` · JWT adulterado · JWT antigo sem `sid`.

**Banco de produção, numa transação com ROLLBACK — 15 de 15:** tabelas com RLS · UPDATE atômico com o
JOIN em `users` · hash anterior guardado · `least()` do teto · `stale` · `purge` · banco idêntico no fim.

**HTTP contra `next start` — 14 de 14:**

| Caso | Resultado |
|---|---|
| `/pictures` sem sessão | 307 → `/login` |
| só o refresh, sem access | **200** — a página leu o access novo na mesma requisição; `Set-Cookie` dos dois |
| cookies | httpOnly, Secure, SameSite=lax; access `Max-Age=900`; resposta `no-store` |
| refresh antigo logo em seguida | 200, só access novo |
| par novo | 200, nenhum `Set-Cookie` |
| refresh antigo fora da janela | 307, cookies apagados, `revoked_reason = reuse` |
| access ainda válido como JWT, sessão revogada | 307 → `/login` |
| refresh malformado | 307, cookie apagado |
| server action sem sessão | passa pelo proxy (404 da action inexistente, não 307) |
| landing page | 200, sem `Set-Cookie` |

A sessão criada para o teste HTTP foi apagada; a tabela terminou vazia.

## ❌ Não verificado

- **Login e logout pelo formulário** (`signIn` / `signOut` → `startSession` / `endSession`). A sessão do
  teste foi aberta por `openSession` direto, sem senha
- Troca de senha pelo perfil reemitindo a sessão
- Navegador de verdade; produção na Vercel

## Pendências conhecidas

- **Sem rate limit no login** (já apontado na spec 002). Continua sendo o maior buraco restante
- Não há tela de "sessões abertas / sair de todos os aparelhos". A tabela já permite
