# Análise econômica

> Todas as contas assumem o ticket real de R$ 200–800 (ver `00-contexto-negocio.md`).
> Números marcados `[EST]` são estimativas com a premissa ao lado.

## Custo por sessão

```
Custo fixo mensal
  Adobe Photography Plan         R$  60   [EST]
  DAS MEI (serviços)             R$  86,05
  Domínio (R$ 40/ano)            R$   3,33
  Hospedagem                     R$  25   [EST]
  ─────────────────────────────────────────
  TOTAL FIXO                     R$ 174,38/mês

Equipamento R$ 8.000 depreciado em 3 anos  = R$ 222,22/mês   [EST]
Deslocamento por sessão                     = R$  40         [EST]
Horas por sessão (captação + edição + atendimento) = 6 a 9h
  (edição consome 2–4x o tempo da captação)
```

### A 3 sessões/mês (36/ano) — cenário de crescimento

```
deslocamento          R$  40
rateio fixo (174÷3)   R$  58
depreciação (222÷3)   R$  74
──────────────────────────────
custo por sessão      R$ 172

Ticket R$ 200 → margem R$  28  → ÷7h = R$  4,00/h
Ticket R$ 500 → margem R$ 328  → ÷7h = R$ 46,86/h
Ticket R$ 800 → margem R$ 628  → ÷7h = R$ 89,71/h
```

> R$ 4,00/h é **54% do salário mínimo por hora** (R$ 1.621 ÷ 220 = R$ 7,37).

### 🔴 No volume REAL (8 sessões/ano) — a conta que importa hoje

```
custo por sessão = 40 + (2.100÷8) + (2.667÷8) = R$ 635

Sessão de R$ 200 → PREJUÍZO de R$ 435 + 7h de trabalho de graça
Sessão de R$ 500 → PREJUÍZO de R$ 135
Sessão de R$ 800 → sobra R$ 165 → R$ 23,57/h
```

Mesmo no topo da faixa, o negócio rende R$ 23,57/h — **abaixo do piso de R$ 50/h**
que as fontes brasileiras citam para fotógrafo iniciante.

### Piso de preço defensável

```
custo por sessão a 3/mês   R$ 172
+ 7h × R$ 50/h             R$ 350
────────────────────────────────────
= R$ 522
```

**R$ 500 deveria ser o pacote de ENTRADA, não o meio da faixa.**
R$ 200 sai da tabela ou vira add-on (foto extra, entrega expressa) — nunca sessão completa.

> ⚠️ Consequência para este projeto: **se a landing page funcionar bem a R$ 200,
> ela perde dinheiro mais rápido.** Corrigir a tabela vale +R$ 1.600/ano sem
> um único lead novo — mais do que qualquer otimização de conversão entrega.

## Mídia paga: inviável neste ticket

```
CPC (Meta Ads BR, serviços locais)   R$ 2,50 – 4,00
÷ conversão da LP (2–6%)
= CPL                                 R$ 60 – 200
÷ fechamento de lead frio (5–20%)  [EST]
= CAC                                 R$ 300 – 4.000
```

| Ticket | Margem | CAC otimista R$ 300 | CAC base R$ 1.000 |
|---|---|---|---|
| R$ 200 | R$ 28 | −R$ 272 ❌ | −R$ 972 ❌ |
| R$ 500 | R$ 328 | +R$ 28 ⚠️ | −R$ 672 ❌ |
| R$ 800 | R$ 628 | +R$ 328 ✅ | −R$ 372 ❌ |

**Linha onde mídia paga começa a fechar: ~R$ 1.500–2.000 de ticket.
Ela está de 2 a 15x abaixo.**

Segundo motivo, que sozinho já mata: a Meta pede **50 conversões/semana** para sair
da fase de aprendizado → orçamento diário ≈ CPA × 7 = **R$ 700/dia = R$ 21.000/mês**.
O faturamento acumulado de toda a vida do negócio é ~R$ 4.000.

**Reabrir mídia paga quando:** ticket médio > R$ 1.500 **OU** existir produto
recorrente (vídeo mensal) com LTV > R$ 3.000.

## Teste A/B: inaplicável

Tamanho de amostra (bicaudal, α=0,05, poder 80%):

| Base | Ganho a detectar | Sessões necessárias |
|---|---|---|
| 8% | +20% relativo | ~9.840 |
| 8% | +10% relativo | ~37.700 |
| 5% | +10% relativo | ~62.500 |

Com 30–100 visitas/mês, isso são anos por teste — e ~R$ 20.000 a R$ 50.000 em
cliques para responder uma pergunta. **Use mudança sequencial + gravação de sessão
(Microsoft Clarity é grátis) + leitura das conversas de WhatsApp.**

## Meta realista em 90 dias

```
180 visitas → 5% contato → 9 contatos → 25% fecha → 2,3 sessões
Receita direta: ~R$ 1.250
```

**Meta: 8 a 12 contatos e 2 a 3 sessões atribuíveis à página em 90 dias.**
**Teto de investimento defensável no site: R$ 800–1.000 total.**

| Sintoma | Diagnóstico |
|---|---|
| < 4 contatos em 90 dias | Não é a página. É **distribuição** — não está chegando tráfego |
| 8+ contatos, 0 sessões | A página funcionou. É **preço, portfólio ou atendimento** |
| Gasto > R$ 1.000 | Falha de dimensionamento, independente do resultado |

**Não é fracasso:** conversão de 3%. O benchmark real é 2–6% (Unbounce: mediana 6,6%;
RD Station: páginas comerciais entre 2% e 5%).

**A métrica que mais importa não é nenhuma dessas:** quantas conversas de WhatsApp
terminaram sem ela ter que digitar preço e entregáveis.
