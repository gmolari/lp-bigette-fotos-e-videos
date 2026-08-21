# Como este projeto chegou aqui

Resumo da sessão que originou o projeto, para quem pegar o repositório do zero.

## Linha do tempo

1. **Pesquisa v1** — levantamento de "LPs de fotógrafo" a partir de um artigo
   agregador. Produziu 12 referências, 10 seções recomendadas, padrões de conversão,
   e a tese "são 3 LPs, não 1". Foi desenhada numa página do Figma.

2. **Auditoria adversarial** — três críticos independentes (CRO/mídia paga, mercado
   BR de fotografia, verificação factual), com a tarefa explícita de refutar.
   Resultado: a v1 estava estruturalmente comprometida. Ver `99-historico-erros.md`.

3. **Contexto real chega** — ticket de R$ 200–800, 500 seguidores, 8 sessões,
   iniciante. Isso invalidou não só a v1, mas parte das próprias críticas
   (o diagnóstico "o gargalo é sábado" pressupõe agenda cheia; a ocupação real é 8–17%).

4. **Pesquisa v2** — 33 páginas abertas uma a uma. Referências novas, compatíveis
   com o ticket real. Ver `01-pesquisa-referencias.md`.

5. **Decisão de posicionamento do cliente** — sem preço na página, vender
   experiência, gatilho a cada seção, tudo para o WhatsApp. Ver D1 em `03-decisoes.md`.

6. **Protótipo em HTML** → validado → **projeto Next.js** (este repositório).

## Lições de processo

**Uma nota metodológica honesta não conserta uma conclusão errada.** A v1 registrou
que os layouts eram inferidos e não observados. A ressalva estava lá e não impediu
nada — porque um artefato visual, uma vez desenhado, é lido como evidência por quem
o vê depois.

**Pergunte o ticket antes de recomendar arquitetura.** Cinco decisões de maior custo
(tese central, sequência, estrutura, política de preço, benchmark de sucesso) foram
tomadas sem o único número que as determinava.

**Críticos independentes valem o custo.** Os três encontraram o erro de fabricação,
o benchmark invertido e a ausência total de vídeo na arquitetura — coisas que a
própria autoria não veria.

**Mas críticos herdam premissas erradas também.** Os três recomendaram sobre o
ticket errado, porque ele não estava no briefing. Contexto ruim contamina revisão
tanto quanto contamina o trabalho original.
