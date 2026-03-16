# Setup do CRON Agendado com Períodos

## O que foi implementado

Sistema de cobrança automática com agendamento em períodos (Manhã, Tarde, Noite) com horários aleatórios para distribuir a carga.

## Arquivos criados/modificados

### 1. **Composable** (`app/composables/useCronScheduler.ts`)
- Gera horários aleatórios dentro de períodos
- Calcula próxima execução
- Formata datas

### 2. **Modal atualizado** (`app/components/blocks/KFinanceAutoBillingModal.vue`)
- Mostra 3 opções de período (Manhã 7-11h, Tarde 11-14h, Noite 14-19h)
- Preview do horário gerado
- Se já tem CRON ativo, mostra horário agendado com opção de alterar/desativar

### 3. **API de agendamento** (`server/api/subscriptions/cron-schedule.post.ts`)
- Salva/atualiza CRON no banco
- Suporta ativar, desativar e alterar

### 4. **CRON executor** (`server/api/cron/billing-scheduled.ts`)
- Executa cobranças nos horários agendados
- Respeita os períodos
- Gera novo horário para próxima execução

### 5. **Handlers atualizados** (`app/composables/useSubscriptions.ts`)
- `handleConfirmAutoBilling` - Agora chama a API de agendamento
- `handleConfirmBatchAutoBilling` - Agendamento em massa

### 6. **Migration SQL** (`add_cron_fields_to_payments.sql`)
- Adiciona campos à tabela payments

## Passo a passo para usar

### 1. Executar a migration no Supabase

```sql
-- Copiar e executar o conteúdo de add_cron_fields_to_payments.sql
-- no SQL Editor do Supabase
```

### 2. Configurar o CRON no seu servidor

Você precisa chamar a API `/api/cron/billing-scheduled` em intervalos regulares (a cada minuto é ideal).

**Opção A: Usando um serviço externo (Recomendado para SaaS)**

Use [Trigger.dev](https://trigger.dev) ou [EasyCron](https://www.easycron.com):

```bash
# Chamar a cada minuto
GET https://seu-dominio.com/api/cron/billing-scheduled
Authorization: Bearer kros-cron-secret-123
```

**Opção B: Usando Supabase Cron (se disponível)**

```sql
-- No Supabase, criar uma função que chama a API
select cron.schedule('billing-scheduled', '* * * * *', 'http://seu-dominio.com/api/cron/billing-scheduled');
```

**Opção C: Usando Node-cron localmente**

```typescript
// server/utils/cron-scheduler.ts
import cron from 'node-cron'

export function initCronScheduler() {
  // Executar a cada minuto
  cron.schedule('* * * * *', async () => {
    try {
      await fetch('http://localhost:3000/api/cron/billing-scheduled', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET}`
        }
      })
    } catch (err) {
      console.error('Erro ao executar CRON:', err)
    }
  })
}
```

### 3. Testar no painel

1. Vá para **Assinaturas**
2. Clique no ícone de CRON (relógio) em uma assinatura
3. Escolha um período (Manhã, Tarde ou Noite)
4. Customize a mensagem se quiser
5. Clique em "Agendar Cobrança"
6. Você verá o horário exato que será enviado

### 4. Verificar agendamentos

No banco de dados, você pode ver:

```sql
SELECT 
  id,
  company_id,
  cron_enabled,
  cron_period,
  cron_scheduled_time,
  cron_next_execution
FROM payments
WHERE cron_enabled = true
ORDER BY cron_next_execution;
```

## Como funciona

### Fluxo de agendamento

1. **Usuário clica no ícone de CRON** → Abre modal
2. **Seleciona período** (Manhã/Tarde/Noite)
3. **Sistema gera horário aleatório** dentro do período (ex: 09:15)
4. **Mostra preview** da próxima execução
5. **Confirma** → Salva no banco com `cron_enabled = true`

### Fluxo de execução

1. **CRON executor roda a cada minuto**
2. **Busca pagamentos com** `cron_enabled = true` E `cron_next_execution <= agora`
3. **Envia mensagem** via WhatsApp
4. **Gera novo horário** para próxima execução (mesmo período)
5. **Atualiza** `cron_next_execution` no banco

### Distribuição de carga

- **Manhã**: 7h - 11h (4 horas)
- **Tarde**: 11h - 14h (3 horas)
- **Noite**: 14h - 19h (5 horas)

Se você tem 50 clientes com vencimento no mesmo dia:
- Alguns recebem às 09:15
- Outros às 09:42
- Outros às 10:08
- Etc...

Isso distribui naturalmente os 50 POST requests ao longo de horas, não segundos.

## Variáveis de mensagem

```
{{empresa}}      - Nome da empresa
{{valor}}        - Valor formatado em BRL
{{vencimento}}   - Data de vencimento (DD/MM/YYYY)
{{plano}}        - Nome do plano
```

## Logs

Todas as mensagens enviadas são registradas em `message_logs` com:
- `log_type: 'cron_billing_scheduled'`
- `is_cron: true`
- Status (Sucesso ou Erro)

## Troubleshooting

### Mensagens não estão sendo enviadas

1. Verificar se `cron_enabled = true` no banco
2. Verificar se `cron_next_execution` é menor que agora
3. Verificar se a API de CRM está configurada
4. Verificar logs em `message_logs`

### Horários não estão sendo respeitados

1. Verificar se o CRON executor está rodando
2. Verificar se o token `CRON_SECRET` está correto
3. Verificar logs do servidor

### Muitas mensagens simultâneas

Se ainda assim tiver picos, você pode:

1. Adicionar delay entre envios no CRON executor
2. Usar fila (Bull/BullMQ)
3. Distribuir entre múltiplas instâncias

## Próximos passos

- [ ] Adicionar retry automático em caso de falha
- [ ] Adicionar dashboard de agendamentos
- [ ] Adicionar webhook para notificar quando enviado
- [ ] Adicionar suporte a múltiplos períodos por cliente
