# ✅ Implementação: CRON Agendado com Períodos

## O que foi implementado

Sistema completo de cobrança automática com agendamento em períodos (Manhã, Tarde, Noite) com horários aleatórios para distribuir a carga de forma natural.

## Arquivos criados

### 1. **Composable** 
- `app/composables/useCronScheduler.ts` - Lógica de geração de horários aleatórios

### 2. **Componentes Vue**
- `app/components/blocks/KFinanceAutoBillingModal.vue` - Modal atualizado com seleção de períodos

### 3. **APIs**
- `server/api/subscriptions/cron-schedule.post.ts` - Salva/atualiza/desativa CRON
- `server/api/cron/billing-scheduled.ts` - Executor do CRON que respeita horários agendados

### 4. **Banco de dados**
- `add_cron_fields_to_payments.sql` - Migration para adicionar campos

### 5. **Documentação**
- `CRON_SCHEDULED_SETUP.md` - Guia completo de setup

## Arquivos modificados

- `app/composables/useSubscriptions.ts` - Handlers atualizados para usar nova API

## Como usar

### 1. Executar a migration

Copie o conteúdo de `add_cron_fields_to_payments.sql` e execute no Supabase SQL Editor.

### 2. Configurar o CRON executor

O CRON precisa ser chamado a cada minuto. Escolha uma opção:

**Opção A: Trigger.dev (Recomendado para SaaS)**
```bash
# Criar um job que executa a cada minuto
GET https://seu-dominio.com/api/cron/billing-scheduled
Authorization: Bearer kros-cron-secret-123
```

**Opção B: EasyCron ou similar**
- URL: `https://seu-dominio.com/api/cron/billing-scheduled`
- Header: `Authorization: Bearer kros-cron-secret-123`
- Frequência: A cada minuto

**Opção C: Node-cron (local)**
```typescript
import cron from 'node-cron'

cron.schedule('* * * * *', async () => {
  await fetch('http://localhost:3000/api/cron/billing-scheduled', {
    headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` }
  })
})
```

### 3. Testar no painel

1. Vá para **Assinaturas**
2. Clique no ícone de CRON (relógio) em uma assinatura
3. Escolha um período:
   - **Manhã**: 7h - 11h
   - **Tarde**: 11h - 14h
   - **Noite**: 14h - 19h
4. Customize a mensagem (opcional)
5. Clique em "Agendar Cobrança"
6. Você verá o horário exato (ex: 09:15)

## Fluxo de funcionamento

### Agendamento
```
Usuário clica no ícone CRON
    ↓
Modal abre com 3 períodos
    ↓
Seleciona período (ex: Manhã)
    ↓
Sistema gera horário aleatório (ex: 09:15)
    ↓
Mostra preview da próxima execução
    ↓
Confirma → Salva no banco
```

### Execução
```
CRON executor roda a cada minuto
    ↓
Busca pagamentos com cron_enabled=true E cron_next_execution <= agora
    ↓
Envia mensagem via WhatsApp
    ↓
Gera novo horário (mesmo período)
    ↓
Atualiza cron_next_execution
```

## Distribuição de carga

Se você tem 50 clientes com vencimento no mesmo dia:

- **Sem CRON agendado**: 50 POST requests em segundos → Pode derrubar a API
- **Com CRON agendado**: 
  - Alguns recebem às 09:15
  - Outros às 09:42
  - Outros às 10:08
  - Etc...
  - Distribuído ao longo de horas

## Campos adicionados ao banco

```sql
cron_enabled BOOLEAN          -- Se está ativado
cron_period VARCHAR(20)       -- Período (morning/afternoon/evening)
cron_scheduled_time TIME      -- Horário exato (ex: 09:15)
cron_next_execution TIMESTAMP -- Próxima execução
```

## Variáveis de mensagem

```
{{empresa}}      - Nome da empresa
{{valor}}        - Valor formatado em BRL
{{vencimento}}   - Data de vencimento (DD/MM/YYYY)
{{plano}}        - Nome do plano
```

## Logs

Todas as mensagens são registradas em `message_logs`:
- `log_type: 'cron_billing_scheduled'`
- `is_cron: true`
- Status (Sucesso ou Erro)

## Próximos passos (opcional)

- [ ] Adicionar retry automático
- [ ] Dashboard de agendamentos
- [ ] Webhook para notificar quando enviado
- [ ] Suporte a múltiplos períodos por cliente
- [ ] Integração com Trigger.dev

## Troubleshooting

**Mensagens não estão sendo enviadas:**
1. Verificar se `cron_enabled = true` no banco
2. Verificar se `cron_next_execution <= agora`
3. Verificar se API de CRM está configurada
4. Verificar logs em `message_logs`

**Horários não estão sendo respeitados:**
1. Verificar se CRON executor está rodando
2. Verificar se token `CRON_SECRET` está correto
3. Verificar logs do servidor

## Resumo técnico

- ✅ Modal com 3 períodos (Manhã/Tarde/Noite)
- ✅ Geração de horários aleatórios
- ✅ Preview da próxima execução
- ✅ Salva no banco com campos específicos
- ✅ CRON executor que respeita horários
- ✅ Distribuição natural de carga
- ✅ Suporte a batch (em massa)
- ✅ Logs detalhados
- ✅ Sem erros de tipo (TypeScript)
