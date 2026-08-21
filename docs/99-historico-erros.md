# Histórico de erros — leia antes de reintroduzir qualquer coisa "da pesquisa antiga"

> Este arquivo existe para impedir que conclusões já derrubadas voltem ao projeto.
> Se algo aqui parecer uma boa ideia, é porque pareceu antes também.

## ⛔ O arquivo do Figma está DESATUALIZADO

**"LP - Bigette Fotos e Videos"** — `figma.com/design/x8HmXnVlnUUtYZVbnpuFHt`

A página 01 desse arquivo contém a **pesquisa v1, que foi invalidada**. Em especial,
os **12 "esqueletos de layout"** desenhados lá **são ficção**: foram inferidos de
descrições de texto de segunda mão, não de observação dos sites.

**Não use aquele arquivo como fonte.** A pesquisa correta é `docs/01-pesquisa-referencias.md`.

*(A página não foi corrigida porque a cota de chamadas MCP do Figma no plano Starter
estourou. Para destravar, mover o arquivo para um time no plano Pro.)*

---

## Os erros da v1, e por que aconteceram

### Erro raiz: não abri os sites
A v1 leu **um** artigo agregador (landingi.com), pegou 9 dos 17 sites que ele lista,
tirou 3 brasileiros de snippets de busca — e daí desenhou os layouts como se
conhecesse a estrutura.

Havia uma ferramenta de leitura de página funcionando o tempo todo. Ela foi usada
para ler os artigos-fonte e **não** para verificar as referências.

> **Regra que sai disso: toda página citada como referência tem que ser aberta.
> Se não abrir, escreve INACESSÍVEL e não usa.**

### Erros factuais confirmados

| Afirmação da v1 | Realidade |
|---|---|
| "Fredi Fotos é a referência mais próxima" | `fredifotos.com.br/landingpage` → **404**. A página não existe |
| "Justin Kunimoto expõe preço na página" | A home **não** mostra preço. Existe tabela, em página separada |
| "Lugar Para Dois: hero com a palavra ENSAIOS" | O hero é um slideshow. "Ensaios" é item de menu que apareceu no snippet |
| "Mango Studios tem FAQ na LP" | O FAQ está em página separada, no dropdown "About Us" |
| Os 12 esqueletos de layout | Inferidos de texto. **Ficção** |

### Erro de categoria
O artigo da Landingi é marketing de conteúdo de uma empresa **que vende software de
landing page**, e chama de "LP" um conjunto de sites de portfólio.

**Zero das 12 referências da v1 são landing pages.** Todas têm menu completo.
Consequência: a v1 recomendou "esconder o menu" citando 12 sites que todos têm menu.

### Benchmark invertido
A v1 citou RD Station: LPs brasileiras convertendo de 31% a 96%. Aqueles números são
reais **mas são de páginas de material gratuito** (ebook, quiz, sorteio), de clientes
da própria RD, autorrelatados, curados como vitrine.

O benchmark real:
- Unbounce (41 mil LPs): **mediana 6,6%**; Professional Services 6,1%
- WordStream (18 mil campanhas): Arts & Entertainment 4,22%
- **RD Station, no artigo ao lado: páginas comerciais ficam entre 2% e 5%**

A frase da v1 — *"LP de serviço bem segmentada não converte 2%"* — está **invertida**.
Se aquela expectativa chegasse ao cliente, uma página performando 3% seria declarada
fracasso estando dentro do normal.

### Erro de ordem de grandeza
A v1 assumiu ticket de R$ 4.000–8.000 sem nunca dizer. O ticket real é **R$ 200–800**.
Isso inverteu, e não apenas ajustou: a tese das 3 LPs, a sequência de nichos, a
viabilidade de mídia paga e o diagnóstico do gargalo.

---

## ⛔ Tailwind v4: `translate-*` NÃO é `transform`

`translate-y-9` escreve a propriedade **`translate`**. `scale-*` escreve
**`scale`**. `rotate-*` escreve **`rotate`**. Nenhuma das três escreve
`transform`.

Uma lista de transição escrita à mão que diga `transform` desliga as
três **sem erro nenhum**: a propriedade existe, o valor é válido, o
elemento aparece no lugar certo — e a animação simplesmente não roda.
O elemento teleporta.

Foi assim que a troca de texto do varal passou por **duas rodadas de
conserto** com o diagnóstico errado (mexeu-se em zona morta e em tempo
mínimo de permanência, os dois medidos e os dois inúteis) antes de
alguém amostrar `getComputedStyle` quadro a quadro e reparar que a
coluna do deslocamento estava sempre zerada. Detalhes em
`09-movimento-3d.md`.

> **Regra:** ao escrever `transition-[...]` à mão, confira a
> propriedade CALCULADA, não o nome do utilitário. Ou escreva as
> propriedades animadas em `style`, que é o que o `Sala.tsx` faz hoje —
> aí declaração e transição não têm como divergir.

E a lição de método é a mesma do resto deste arquivo, noutra roupa:
**a medição que eu tinha respondia à pergunta errada.** Os intervalos
entre trocas estavam certos em todos os regimes de scroll; o problema
nunca foi quando a troca acontecia.

---

## ❌ Não reintroduzir

| Ideia | Por que caiu |
|---|---|
| 3 landing pages, uma por nicho | 8 sessões ÷ 3 = portfólio vazio em pelo menos uma. Ver D2 |
| Mídia paga | CAC R$ 300–4.000 vs margem R$ 28–628. Ver `02-analise-economica.md` |
| Teste A/B | Precisaria de ~10.000 sessões e R$ 20–50 mil |
| Embed do feed do Instagram | Vaza tráfego + contradiz "velocidade é conversão" |
| Contador de seguidores | 500 exibido é prova social negativa |
| "Casamento primeiro, tem mais volume de busca" | Volume nunca foi medido. E o argumento era circular |
| Barra de credibilidade / prêmios / "X anos" | Ela é iniciante. Seção vazia é pior que seção ausente |
| Uma LP por serviço + cidade | É *doorway page* na política antispam do Google |
| "Restam 3 vagas em novembro" | Publicidade enganosa se não houver agenda real. Ver D8 |
| Isca digital / captura de e-mail | Constrói lista para quem não faz e-mail marketing |

---

## ✅ O que sobreviveu da v1

Casar a headline com o anúncio (irrelevante aqui — não há anúncio, mas correto em
geral), velocidade de carregamento, WhatsApp como canal principal no Brasil,
mobile-first, FAQ, "como funciona", CTA repetido, portfólio curado.

**Sobreviveram como convenções conhecidas de CRO — não como achados de pesquisa.**
Esse enquadramento errado foi o que contaminou tudo.
