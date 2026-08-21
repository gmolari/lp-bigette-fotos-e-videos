# Pendências — o que trava o projeto

## 🔴 BLOQUEADORES REAIS

### ~~1. Número do WhatsApp~~ ✅ RESOLVIDO em 21/08/2026
O número real foi confirmado pela cliente e ligado em `src/config/site.ts`.

> ⚠️ **Ele não está neste repositório.** Contato e handle reais foram
> trocados por placeholder antes de o repo ir a público — `site.ts` traz
> `5500000000000` e `seu_instagram`, os dois marcados `// ⚠️ PREENCHER`.
> **Preencha os dois antes de qualquer deploy**, senão os 11 CTAs abrem
> conversa com número inválido.
Os 11 CTAs apontam para o número real e cada um leva `(vim da seção: X)` no fim
da mensagem. O Instagram real também está preenchido fora do repositório.
Cidade confirmada: **Londrina/PR**.

### 2. A Bigette filma vídeo?
**É a pergunta de maior valor econômico de todo o projeto, e ninguém fez.**

O negócio se chama "Bigette Fotos **e Vídeos**". Três cenários:

| Se… | Consequência |
|---|---|
| **NÃO filma** | O nome é promessa falsa em todo ponto de contato. Cada lead pedindo vídeo é tempo perdido e decepção — e em rede pequena, decepção circula mais rápido que indicação. **A seção de vídeo tem que sair da página.** |
| **Filma** | É o único produto com ticket estruturalmente acima de R$ 800, **e o único que pode ser recorrente**. Reels mensal para negócio local: R$ 500/mês × 12 = R$ 6.000/ano por cliente, margem ~R$ 3.500–4.500. **Um cliente desses cruza a linha da mídia paga. Nenhum ensaio cruza.** |
| **Filma mal / não decidiu** | A marca está travando a decisão. Ela carrega "e Vídeos" no nome vendendo só foto. |

**Custa uma mensagem de WhatsApp.**

### 3. As 8 sessões dela são de quê?
Define o conteúdo inteiro da página. A página tem que ser sobre **o que ela consegue
provar hoje** — não sobre qual nicho paga mais em teoria.

Isso também responde a pergunta "qual nicho primeiro", que estava mal formulada:
não é qual tem mais volume de busca, é de que tipo são as fotos que existem.

---

## 🟡 PREENCHER ANTES DO DEPLOY

Tudo em `src/config/site.ts`, marcado com `// ⚠️ PREENCHER`:

- [x] `city`, `state`, `region` — **Londrina / PR / Londrina e região**
- [x] `geo.lat` / `geo.lng` — −23,3045 / −51,1696
- [x] `areasAtendidas` — Londrina, Cambé, Ibiporã, Rolândia, Arapongas, Jataizinho
- [x] `instagram` — preenchido fora do repositório (placeholder aqui)
- [ ] `serviceRadiusKm` — está em 50 km por suposição. **Conferir com ela**
- [ ] `prazoEntregaDias` — está em 10 por suposição. **Conferir com ela**
- [ ] `email`, `horarioAtendimento`
- [ ] `legalName` / MEI
- [ ] `NEXT_PUBLIC_SITE_URL` no `.env.local`

### 🟡 As fotos que estão lá hoje são do Unsplash

`public/portfolio/01.jpg` … `07.jpg` e `public/hero.jpg` são **provisórias**,
para dar para avaliar recorte, composição e a cena 3D. Origem registrada em
`public/portfolio/CREDITOS.txt`.

A licença do Unsplash permite uso comercial — **o problema não é jurídico.**
O problema é que um portfólio é a prova de que ela sabe fotografar, e
publicar trabalho de outra pessoa como se fosse dela é a mesma classe de
erro dos depoimentos inventados. Em Londrina, alguém reconhece.

> ⚠️ Enquanto elas estiverem no ar, o rodapé mente: ele diz *"Todas as
> imagens são de autoria própria e protegidas por direitos autorais"*.
> A frase volta a ser verdade no minuto em que as fotos dela entrarem —
> por isso o texto ficou como está, mas **não mostre a página para
> terceiros com as fotos de banco.**

Faltam ainda, sem substituto provisório: o frame do vídeo (`Video.tsx`) e a
foto da própria Bigette (`Sobre.tsx`). Essas duas eu não inventaria nem
provisoriamente — pôr um rosto qualquer no lugar do dela seria pior que o
espaço vazio.

> ⚠️ **As 4 frases de depoimento em `content.ts` são placeholder, e duas delas
> foram copiadas da referência Deborah Menezes** (ver `01-pesquisa-referencias.md`).
> Não podem ir ao ar. Publicar depoimento inventado é o mesmo problema que
> derrubou o "restam 3 vagas" na D8 — CDC art. 37 — e ainda é copy de
> concorrente. O item 3 do bloco verde abaixo é o insumo real.

---

## 🟢 ANTES DA PÁGINA — vale mais que ela

Ordem recomendada. Tudo custo zero.

| # | Ação | Prazo | Por quê |
|---|---|---|---|
| 1 | **Refazer a tabela de preços. Piso R$ 500** | 1 dia | +R$ 1.600/ano sem um único lead novo. E impede a página nascer publicando preço que dá prejuízo |
| 2 | **Criar o Perfil da Empresa no Google** | 1h | Único canal gratuito com intenção de compra. Coleta avaliações. **Se fosse fazer só uma coisa, seria essa** |
| 3 | **Coletar depoimentos das 8 clientes** | 1 semana | 8 mensagens. Meta: 3 com autorização de nome + 3 avaliações no Google. É o insumo da seção mais importante |
| 4 | **Fechar 5–10 sessões pelos canais que já tem** | 60–90 dias | Ataca o gargalo real e produz o portfólio que faz a página funcionar |

> **Uma iniciante com 8 trabalhos e uma LP linda continua sendo uma iniciante com
> 8 trabalhos.** A página não é a prioridade — mas também não é cara o bastante
> para ser o problema. O problema é a ordem.

**Não precisa vir antes:** mais equipamento, mais curso, rebranding. São as três
formas favoritas de fotógrafo iniciante adiar prospecção — e prospecção é o gargalo.
