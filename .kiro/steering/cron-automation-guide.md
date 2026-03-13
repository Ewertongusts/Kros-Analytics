---
inclusion: auto
---

# Guia de Automação CRON - Sistema de Mensagens Automáticas

## Visão Geral

O novo sistema de CRON permite enviar mensagens automáticas em horários específicos com base no status de pagamento dos clientes. Cada horário tem uma segmentação diferente para maximizar a efetividade.

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│ Configuração (cronConfig.ts)                            │
│ - Define 5 horários de envio                            │
│ - Cada um com filtros específicos                       │
│ - Templates de mensagens customizáveis                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ API CRON (billing-v2.ts)                                │
│ - Recebe schedule_id via query parameter               │
│ - Busca pagamentos com filtros específicos             │
│ - Envia mensagens via Z-API                            │
│ - Registra logs e relatórios                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend (KCronManagement.vue)                          │
│ - Interface para gerenciar horários                    │
│ - Executar CRON manualmente                            │
│ - Visualizar relatórios e estatísticas                 │
└─────────────────────────────────────────────────────────┘
```

## Horários de Envio

### 1. Lembrete Matinal (09:00)
**Alvo:** Pagamentos vencendo HOJE
- Filtro: `daysUntilDue = 0`
- Status: `pending`
- Máximo: 500 mensagens/dia
- Propósito: Lembrar clientes no início do dia

**Mensagem Padrão:**
```
Olá {empresa}! 👋

Seu pagamento de {plano} vence HOJE.

💰 Valor: {valor}
📅 Vencimento: {vencimento}

Clique aqui para pagar: {link_pagamento}

Obrigado!
```

### 2. Aviso Intermediário (14:00)
**Alvo:** Pagamentos vencendo em 1-3 dias
- Filtro: `daysUntilDue = 1 a 3`
- Status: `pending`
- Máximo: 500 mensagens/dia
- Propósito: Avisar com antecedência

**Mensagem Padrão:**
```
Olá {empresa}! ⏰

Seu pagamento vence em {dias_restantes} dias.

💰 Valor: {valor}
📅 Vencimento: {vencimento}
📦 Plano: {plano}

Não deixe para última hora! Pague agora: {link_pagamento}
```

### 3. Aviso Urgente (18:00)
**Alvo:** Pagamentos vencendo AMANHÃ
- Filtro: `daysUntilDue = 1`
- Status: `pending`
- Máximo: 500 mensagens/dia
- Propósito: Último aviso antes do vencimento

**Mensagem Padrão:**
```
Olá {empresa}! 🚨

ATENÇÃO: Seu pagamento vence AMANHÃ!

💰 Valor: {valor}
📅 Vencimento: {vencimento}

Pague agora para evitar atrasos: {link_pagamento}
```

### 4. Cobrança de Atraso (10:00)
**Alvo:** Pagamentos atrasados 1-7 dias
- Filtro: `daysUntilDue = -1 a -7`
- Status: `overdue`
- Exclui: Clientes com auto-billing ativado
- Máximo: 300 mensagens/dia
- Propósito: Cobrar atrasos leves

**Mensagem Padrão:**
```
Olá {empresa}! ⚠️

Seu pagamento está ATRASADO há {dias_restantes} dias.

💰 Valor: {valor}
📅 Vencimento: {vencimento}
⏳ Total em atraso: {valor_total_pendente}

Regularize sua situação agora: {link_pagamento}
```

### 5. Cobrança Severa (11:00)
**Alvo:** Pagamentos atrasados 7+ dias
- Filtro: `daysUntilDue = -7 ou menos`
- Status: `overdue`
- Exclui: Clientes com auto-billing ativado
- Máximo: 200 mensagens/dia
- Propósito: Cobrar atrasos graves

**Mensagem Padrão:**
```
Olá {empresa}! 🔴

Seu pagamento está VENCIDO há {dias_restantes} dias!

⚠️ AÇÃO NECESSÁRIA IMEDIATAMENTE

💰 Valor: {valor}
📅 Vencimento: {vencimento}
⏳ Total em atraso: {valor_total_pendente}

Sua conta pode ser suspensa. Pague agora: {link_pagamento}
```

## Variáveis Disponíveis

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{empresa}` | Nome da empresa | Acme Corp |
| `{plano}` | Nome do plano/produto | Digital Flux - Mensal |
| `{valor}` | Valor formatado em BRL | R$ 99,90 |
| `{vencimento}` | Data de vencimento | 15/03/2024 |
| `{dias_restantes}` | Dias até/após vencimento | 3 ou 5 (se atrasado) |
| `{valor_total_pendente}` | Total em atraso | R$ 299,70 |
| `{link_pagamento}` | Link para pagar | https://... |

## Filtros Aplicados

### Filtros Globais (Todos os Horários)
- ✅ Apenas clientes ATIVOS (`is_active = true`)
- ✅ Apenas com WhatsApp configurado
- ✅ Respeita quiet hours (8h-22h)
- ✅ Não envia em feriados
- ✅ Não envia em fins de semana (configurável)

### Filtros Específicos por Horário
- **Lembrete Matinal:** Sem exclusões
- **Aviso Intermediário:** Sem exclusões
- **Aviso Urgente:** Sem exclusões
- **Cobrança de Atraso:** Exclui auto-billing
- **Cobrança Severa:** Exclui auto-billing

## Como Usar

### 1. Configurar no .env

```env
CRON_SECRET=sua-senha-secreta-aqui
NUXT_PUBLIC_CRON_SECRET=sua-senha-secreta-aqui
```

### 2. Executar via Cron Job (Linux/Mac)

```bash
# Executar cada horário
0 9 * * * curl -H "Authorization: Bearer sua-senha" "https://seu-dominio.com/api/cron/billing-v2?schedule_id=morning-reminder"
0 14 * * * curl -H "Authorization: Bearer sua-senha" "https://seu-dominio.com/api/cron/billing-v2?schedule_id=afternoon-warning"
0 18 * * * curl -H "Authorization: Bearer sua-senha" "https://seu-dominio.com/api/cron/billing-v2?schedule_id=evening-urgent"
0 10 * * * curl -H "Authorization: Bearer sua-senha" "https://seu-dominio.com/api/cron/billing-v2?schedule_id=overdue-collection"
0 11 * * * curl -H "Authorization: Bearer sua-senha" "https://seu-dominio.com/api/cron/billing-v2?schedule_id=severe-overdue"
```

### 3. Executar via Painel (Frontend)

1. Acesse a página de Automação
2. Clique em "Executar Agora" para qualquer horário
3. Visualize os resultados em tempo real

### 4. Customizar Mensagens

Edite `server/config/cronConfig.ts` e modifique o campo `template` de cada schedule.

## Relatórios

### Dados Coletados
- Número de pagamentos processados
- Número de mensagens enviadas com sucesso
- Número de mensagens que falharam
- Número de mensagens puladas (sem WhatsApp, etc)
- Tempo de execução
- Timestamp da execução

### Visualizar Relatórios
1. Acesse o painel de Automação
2. Veja as estatísticas gerais no topo
3. Veja as últimas 10 execuções na tabela

### Exportar Dados
```typescript
// Buscar relatórios via API
const { data } = await supabase
  .from('cron_reports')
  .select('*')
  .order('created_at', { ascending: false })
```

## Troubleshooting

### Mensagens não estão sendo enviadas

1. **Verificar se CRON está ativado**
   - Acesse o painel e veja se o toggle está ON
   - Verifique o console para erros

2. **Verificar horário**
   - Confirme que o horário do servidor está correto
   - Verifique quiet hours (8h-22h)

3. **Verificar WhatsApp**
   - Confirme que clientes têm WhatsApp configurado
   - Verifique se Z-API está funcionando

4. **Verificar filtros**
   - Confirme que existem pagamentos que correspondem aos filtros
   - Verifique se clientes estão ativos

### Taxa de sucesso baixa

1. **Verificar Z-API**
   - Confirme que token está correto
   - Verifique limite de requisições

2. **Verificar WhatsApp**
   - Confirme que números estão no formato correto
   - Verifique se números estão bloqueados

3. **Verificar mensagens**
   - Confirme que templates não têm erros
   - Verifique comprimento das mensagens

## Próximas Melhorias

- [ ] Suporte a imagens nas mensagens
- [ ] Suporte a templates por cliente
- [ ] Suporte a A/B testing de mensagens
- [ ] Integração com outras plataformas (SMS, Email)
- [ ] Análise de taxa de conversão
- [ ] Retry automático com backoff exponencial
- [ ] Webhook para eventos de CRON

## Segurança

- ✅ Token de autenticação obrigatório
- ✅ Logs de todas as execuções
- ✅ Limite de mensagens por dia
- ✅ Validação de dados antes de envio
- ✅ Tratamento de erros robusto

## Performance

- ✅ Processamento em lote
- ✅ Limite de 500 mensagens por execução
- ✅ Timeout de 30 segundos por requisição
- ✅ Índices no banco para queries rápidas
- ✅ Cache de configurações

## Suporte

Para dúvidas ou problemas, consulte:
- Logs em `message_logs` tabela
- Relatórios em `cron_reports` tabela
- Console do navegador para erros de frontend
