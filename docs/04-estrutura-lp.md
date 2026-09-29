# Estrutura da landing page

11 seções, 11 saídas para o WhatsApp. Baseada na ordem real da Juh Photos
(ver `01-pesquisa-referencias.md`), adaptada para quem não tem autoridade a alegar.

```
00  TopBar          barra fixa: logo + botão WhatsApp
01  Hero            foto forte + headline + CTA + escassez honesta
02  FaixaImpacto    faixa laranja com a frase de virada
03  Experiencia     3 cards — o que acontece no dia          → gatilho
04  Sala            VARAL 3D — seção presa, 4 paradas         → gatilho na 4ª
05  Depoimentos     4 frases curtas de reação                → gatilho
06  Video           seção própria — metade da marca          → gatilho
07  ComoFunciona    4 passos (substitui autoridade)          → gatilho
08  Sobre           foto + primeira pessoa                   → gatilho
09  Faq             6 perguntas, "quanto custa" aberta       → gatilho
10  CtaFinal        fechamento agressivo
11  Footer + WhatsAppFloat
```

## Por que essa ordem

**Preço não aparece** (decisão D1), então a ordem da Juh Photos foi adaptada:
onde ela põe "pacotes e preços", nós pomos **experiência**. A lógica se mantém —
os dois ativos mais fracos (portfólio de 8 fotos e "sobre" de iniciante) ficam
depois do argumento de valor, não antes.

**"Como funciona" antes de "Sobre"**: processo explícito é o substituto de
autoridade. Ela não pode dizer "20 anos de mercado", mas pode dizer exatamente
o que vai acontecer do primeiro "oi" até a entrega.

**Vídeo antes de "Como funciona"**: o gatilho da seção de vídeo força a escolha
(*"Foto você vai ter. Vídeo, só se você pedir."*) enquanto o visitante ainda está
decidindo o escopo, não depois.

## Os 11 gatilhos

| Seção | `source` | Frase |
|---|---|---|
| TopBar | `barra-fixa` | — |
| Hero | `hero` | *Atendo poucas sessões por mês para não entregar nada correndo.* |
| Experiência | `experiencia` | *Você não precisa estar pronta. Só precisa marcar.* |
| Portfólio | `portfolio` | *Imagina você aqui no meio dessas.* |
| Depoimentos | `depoimentos` | *A próxima frase dessa lista pode ser a sua.* |
| Vídeo | `video` | *Foto você vai ter. Vídeo, só se você pedir.* |
| Como funciona | `como-funciona` | *O passo 1 leva trinta segundos.* |
| Sobre | `sobre` | *Me conta o que você quer registrar. Eu adoro essa parte.* |
| FAQ | `faq` | *Ficou alguma dúvida que não está aqui?* |
| CTA final | `cta-final` | *Daqui a um ano você vai querer ter essas fotos.* |
| Flutuante | `botao-flutuante` | — |

## Onde mexer

| Quero mudar | Arquivo |
|---|---|
| As 4 paradas do varal (frase, texto, foto) | `src/config/content.ts` → `sala.estacoes` |
| A trajetória da câmera 3D | `src/components/three/cenas.ts` → `PARADAS` |
| Qualquer texto, incluindo os gatilhos | `src/config/content.ts` |
| WhatsApp, cidade, prazo, raio, Instagram | `src/config/site.ts` |
| Cores e tipografia | `src/app/globals.css` (bloco `@theme`) |
| Ordem das seções | `src/app/page.tsx` |
| O componente do gatilho | `src/components/ui/Gatilho.tsx` |

## Trocar os placeholders por fotos reais

**Banner, cordel e polaroides:** pelo painel. Envie em `/pictures` (banco de
imagens, spec 005) e atrele a cada seção em `/sections` (spec 006), onde também
se ordena. Seção vazia ou com menos de 4 fotos é completada com as provisórias.

**Vídeo e "sobre"** também pelo painel, em `/sections` (spec 007): a foto da Bigette,
e o vídeo por link do YouTube, com capa. Vazios, mostram o espaço reservado — nunca
um rosto qualquer.

⚠️ **Os `alt` já estão escritos em `content.ts`. Não apague** — é o que faz as
fotos aparecerem no Google Imagens.
