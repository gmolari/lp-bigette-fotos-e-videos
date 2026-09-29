# Spec 003 — Papéis, usuários, perfil e ajustes de UI

**Status:** ✅ entregue em 26/09/2026 · depende da 002

## Pedido

1. Hover/cursor em todo elemento interativo (botão estava sem `cursor-pointer`)
2. Foco do input mais bonito (o contorno era feio)
3. Olho para mostrar/ocultar senha
4. Papéis `admin` e `member`; primeiro admin pelo terminal; admin cria membros e admins
5. Perfil: alterar nome, e-mail, username e senha; login por e-mail **ou** username
6. Admin lista e edita qualquer usuário

## Banco — migration `0002_user_roles_and_username`

| Coluna | Regra |
|---|---|
| `username` | `text NOT NULL UNIQUE`, CHECK `^[a-z][a-z0-9._-]{2,29}$` |
| `role` | enum `user_role ('admin','member')`, padrão `member` |
| `session_version` | `int`, padrão 1 — vai no JWT; incrementar mata as sessões |
| `email` | + CHECK `email = lower(email)` |

**Editada à mão**: o drizzle-kit gerava `ADD COLUMN username NOT NULL`, que falha
com linha existente. Adiciona nulável → preenche pelo e-mail → NOT NULL.

**Usuários existentes viraram admin** (havia um — a dona do painel; o username foi
derivado da parte do e-mail antes do `@`). Antes da migration todo usuário tinha acesso total;
rebaixar em silêncio trancaria a dona do painel fora de `/users`.

Ensaiada em transação com ROLLBACK antes de aplicar — o ensaio pegou um bug
(`rpad(x, 3)` também **corta**: o username sairia `vic`).

## Papéis

| | member | admin |
|---|---|---|
| `/pictures`, `/sections`, `/profile` | ✅ | ✅ |
| `/users` (listar, criar, editar, excluir) | 404 | ✅ |

"Membros não têm acesso completo, sem especificações" → por ora só `/users` é
restrito. Quando `/pictures` e `/sections` ganharem função, decidir por tela.

Regras (em `modules/users/application/admin.ts`, testadas com repositório falso):
- não rebaixar nem excluir o **último admin**
- não excluir a **própria** conta
- senha trocada pelo admin → sessões daquele usuário encerradas

## Sessão conferida no banco

O JWT passou a carregar só `{ sub, ver }`. A cada requisição, `getCurrentUser()`
(`modules/auth/guards.ts`, com `cache` do React) busca o usuário e confere:
existe? `session_version` bate? Papel é o **atual**.

Consequências, todas verificadas:
- promover membro a admin → vale na hora, mesma sessão
- trocar senha (própria ou pelo admin) → outras sessões caem; a atual é reemitida
- excluir usuário → sessão dele cai

### ⚠️ Bug encontrado no teste: loop de redirecionamento

JWT com assinatura válida mas versão velha: o proxy (só assinatura) mandava
`/login → /pictures`; o layout (banco) mandava `/pictures → /login`. Infinito.
**Correção:** o proxy não pula mais o login; `/login` decide "já logado" no
servidor, pelo banco. Aviso deixado no `proxy.ts`.

## Login

Campo único "E-mail ou usuário": tem `@` → e-mail, senão username; os dois em
minúsculo. Mensagem de erro única: "Usuário ou senha incorretos."

## Primeiro admin

```bash
npm run user:create -- <email> <username> [--admin] [--name "Nome"]
```
E-mail existente → atualiza senha/username (e papel com `--admin`) e derruba sessões.

## UI

- **Cursor:** regra base em `globals.css` — `button`, `[role=button]`, `select`,
  `summary`, `label[for]`, checkbox/radio ganham `pointer`; desabilitado não.
- **Foco do campo:** a causa do contorno feio era a regra global
  `:focus-visible { outline… border-radius: 4px }` da LP somada ao anel do
  componente. Agora o foco mora no contorno (`.field-control:focus-within`):
  borda acende, fundo sobe um degrau, halo difuso; o rótulo muda para `accent-2`.
  Erro tinge o halo de `erro`. Autocompletar do Chrome não pinta mais o fundo.
- **Olho da senha:** `PasswordField` — não rouba o foco do campo, `aria-pressed`,
  ícone troca com animação; senha visível desliga corretor/sugestões do teclado.
- Novos: `Select` (nativo), `Badge`, `Panel`, `PageHeader`, `FieldShell`.

## Verificação (build de produção, HTTP)

| Caso | Resultado |
|---|---|
| login por username com maiúscula / por e-mail | ok |
| senha errada | "Usuário ou senha incorretos." |
| membro → `/users` / membro chama `listUsers` | 404 / `ACCESS` |
| `listUsers` expõe `passwordHash`/`sessionVersion`? | não |
| criar com username inválido / duplicado | erro no campo |
| perfil com e-mail de outro | "Este e-mail já está em uso." no campo |
| admin exclui a si mesmo | recusado |
| admin troca senha do membro | sessão antiga → `/login`; `/login` 200 (sem loop) |
| promover membro | `/users` 200 na mesma sessão |
| trocar a própria senha: atual errada / confirmação diferente | erro no campo |
| trocar a própria senha certa | esta sessão segue; a outra cai |
| login com username novo e senha nova | ok |
| pacote JS da LP contém código do painel? | não |

Usuários de teste apagados; a usuária real ficou intacta (admin, versão 1).

## Não verificado

- **Visual no navegador** — foco, olho, animações. Chromium headless não roda
  neste WSL (falta `libatk`). Conferir no `npm run dev`.
- Corrida entre dois admins se rebaixando ao mesmo tempo (anotado no código).
