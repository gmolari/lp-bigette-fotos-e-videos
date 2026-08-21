# Registro de decisões

Cada decisão traz o motivo e o que a reverteria. Decisões marcadas com 🔄 foram
**revertidas** em relação a uma versão anterior do projeto — não reintroduza sem ler o porquê.

---

## D1 🔄 — NÃO mostrar preço na página
**Decisão do cliente (Guilherme), 20/08/2026.**

A análise técnica apontava o contrário: a R$ 200–800 o cliente já compara preço,
esconder custa ~R$ 83–133/mês em tempo de WhatsApp respondendo "quanto custa",
e a agenda vazia torna o custo de perder um lead quase zero.

**Mas a decisão é de posicionamento e é do cliente.** A escolha foi vender
experiência, não preço.

**Mitigação implementada:** a pergunta "Quanto custa?" é o **primeiro item do FAQ,
aberto por padrão**, e a resposta é um convite, não um muro:
> *"...eu preferia te mandar a opção certa em vez da mais cara. Me chama no WhatsApp
> que em dois minutos eu te mostro as opções e as datas livres."*

**Reverteria se:** o volume de conversas que morrem em "quanto custa?" ficar alto,
ou se ela quiser filtrar lead em vez de aumentar volume.

---

## D2 🔄 — UMA página, não três
Uma versão anterior defendia 3 LPs (uma por nicho). Com os números reais:
```
8 sessões ÷ 3 nichos = 2,7 por nicho  → pelo menos uma página iria ao ar com portfólio vazio
30–100 visitas ÷ 3 páginas = 1,67 contato/mês por página → nada é aprendível
```
**Reverteria quando:** um nicho tiver 10+ trabalhos de cliente, 3+ depoimentos e
10+ contatos/mês só nele.

---

## D3 🔄 — Sem mídia paga
Ver `02-analise-economica.md`. CAC de R$ 300–4.000 contra margem de R$ 28–628.
**Reverteria se:** ticket médio > R$ 1.500 **ou** existir vídeo recorrente com LTV > R$ 3.000.

---

## D4 — A página é um cartão de visita, não uma LP de tráfego pago
Tráfego realista: **30–100 visitas/mês**, de link da bio, link no WhatsApp e busca
pelo nome. A função muda de **PERSUADIR** para **RESPONDER E DESTRAVAR**.

**Consequências diretas no código:**

| Cai | Por quê |
|---|---|
| Match headline ↔ anúncio | Não existe anúncio |
| Esconder menu / "uma conversão só" | Convenção para proteger CPC. Não há CPC |
| Barra de credibilidade (prêmios, "X anos") | Ela não tem. Vazia = prova social negativa |
| Contador de seguidores | 500 exibido é prova negativa |
| Embed do feed do Instagram | Vaza tráfego + é dos scripts mais pesados que existem |
| Isca digital / captura de e-mail | Constrói lista para quem não faz e-mail marketing |
| Formulário como caminho principal | Atrito puro nesse volume. WhatsApp resolve |
| Pixel / UTM / teste A/B | Com 30–100 visitas não há o que medir |

---

## D5 — Gatilho ao fim de CADA seção
Frase de efeito + botão de WhatsApp fechando todo bloco. São **11 saídas**, todas
para o mesmo destino. Implementado em `src/components/ui/Gatilho.tsx`.

Cada uma passa um `source` distinto (`hero`, `portfolio`, `faq`…). **Não renomeie
sem querer** — é a chave do relatório de conversão.

---

## D6 — Prova social = frase curta de reação, sem nome e sem foto
Modelo Deborah Menezes. É o único formato que ela consegue produzir hoje com 8 sessões.
*Contra-exemplo: Bruno Scramgnon tem uma aba de avaliações vazia na página.*
**Melhor não abrir o espaço do que abrir vazio.**

---

## D7 — Vídeo ganha seção própria
O negócio se chama "Fotos **e Vídeos**" e o vídeo estava ausente de toda a arquitetura
até a v2. É o único produto dela com ticket estruturalmente acima de R$ 800 e o único
que pode ser **recorrente**. Ver `06-pendencias.md` — ainda não sabemos se ela filma.

---

## D8 — Escassez honesta, nunca contador falso
"Atendo poucas sessões por mês para não entregar nada correndo" é verdade e não
envelhece. **Não usar** "restam 3 vagas" sem uma agenda real por trás: além de
publicidade enganosa (CDC art. 37), o mercado de fotografia é rede fechada e a
indicação é o canal mais barato que ela tem.

---

## D9 — Analytics desligado por padrão
Se os IDs no `.env.local` ficarem vazios, **nenhum script de terceiro carrega**.
Página mais rápida, sem necessidade de banner de cookie.

Rastreio que funciona sem ferramenta nenhuma: a mensagem do WhatsApp já abre com
`(vim da seção: portfolio)` no fim. Dá para medir lendo as conversas.

**Exceção, desde 21/08/2026: Vercel Speed Insights.** Fica ligado sempre e não
passa pelo `<Analytics />`, porque não tem ID para preencher.

Não fere a regra do banner de cookie: ele **não grava cookie nem identifica
visitante**, então não pede consentimento. E é o único instrumento que faz
sentido neste volume — com 30–100 visitas/mês não há amostra para medir
conversão (`02-analise-economica.md`), mas LCP e CLS são medidos **por visita**,
não por estatística. Uma visita já diz se a página abriu rápido.

Em deploy na Vercel o script é servido pelo próprio domínio
(`/_vercel/speed-insights/script.js`), então não é requisição a terceiro. Fora
da Vercel o componente não envia nada.

**Reverteria se:** sair da Vercel, ou se o script passar a custar tempo de
carregamento mensurável — que é justamente o que ele existe para medir.

---

## D10 — robots.txt bloqueia scrapers de treino
Libera Google, Bing, OAI-SearchBot e PerplexityBot (mandam tráfego de volta).
Bloqueia GPTBot, CCBot, ClaudeBot, Google-Extended, Bytespider, meta-externalagent.
**As fotos são o ativo dela.**
