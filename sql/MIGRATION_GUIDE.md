# Guia de Migração - Sistema de Assinaturas

Este guia documenta o processo de migração do sistema antigo (companies + payments) para o novo sistema (customers + subscriptions + payments).

## 📋 Visão Geral

A reforma separa os conceitos de:
- **Clientes (customers)**: Dados de contato e informações cadastrais
- **Assinaturas (subscriptions)**: Contratos de planos recorrentes
- **Pagamentos (payments)**: Cobranças individuais geradas pelas assinaturas

## 🗂️ Estrutura de Arquivos SQL

### Scripts Principais

1. **complete_migration_to_subscriptions.sql** ⭐
   - Script consolidado que executa toda a migração
   - Recomendado para executar de uma vez
   - Inclui relatório de migração

2. **create_subscriptions_table.sql**
   - Cria apenas a tabela subscriptions
   - Útil se você já tem a tabela companies configurada

3. **migrate_payments_to_subscriptions.sql**
   - Migra dados de payments para subscriptions
   - Vincula pagamentos existentes às assinaturas

4. **update_companies_for_customers.sql**
   - Adiciona campos de cliente à tabela companies
   - Cria índices para performance

5. **add_customer_id_to_subscriptions.sql**
   - Adiciona campos adicionais à subscriptions
   - Útil para atualizações incrementais

## 🚀 Como Executar a Migração

### Opção 1: Migração Completa (Recomendado)

Execute apenas este arquivo no Supabase SQL Editor:

```sql
-- Executar no Supabase SQL Editor
\i complete_migration_to_subscriptions.sql
```

Ou copie e cole o conteúdo completo do arquivo.

### Opção 2: Migração Passo a Passo

Se preferir executar em etapas:

```sql
-- 1. Atualizar companies
\i update_companies_for_customers.sql

-- 2. Criar tabela subscriptions
\i create_subscriptions_table.sql

-- 3. Migrar dados
\i migrate_payments_to_subscriptions.sql
```

## 📊 Estrutura das Tabelas

### companies (agora representa customers)

```sql
- id (UUID)
- name (TEXT) - Nome do cliente
- email (TEXT)
- phone (TEXT)
- document (TEXT) - CPF/CNPJ
- birthday (DATE)
- segment (TEXT) - Segmento/ramo
- sales_rep (TEXT) - Vendedor responsável
- website (TEXT)
- address_* (TEXT) - Campos de endereço
- tags (TEXT[]) - Tags para categorização
- is_active (BOOLEAN)
- created_at, created_by
```

### subscriptions (nova tabela)

```sql
- id (UUID)
- customer_id (UUID) → companies.id
- plan_id (UUID) → plans.id
- status (TEXT) - active, pending, trial, suspended, cancelled
- start_date (DATE)
- end_date (DATE)
- due_day (INTEGER) - Dia de vencimento (1-31)
- amount (DECIMAL)
- discount_percent (DECIMAL)
- discount_amount (DECIMAL)
- auto_billing_enabled (BOOLEAN)
- auto_billing_message (TEXT)
- notes (TEXT)
- metadata (JSONB)
- created_at, created_by, updated_at, updated_by
```

### payments (atualizada)

```sql
- ... (campos existentes)
- subscription_id (UUID) → subscriptions.id (novo)
```

## 🔄 Fluxo de Dados

### Antes da Migração
```
companies → payments
   ↓
plan_name (string)
```

### Depois da Migração
```
companies (customers) → subscriptions → payments
                           ↓
                        plans (FK)
```

## ✅ Validação Pós-Migração

Execute estas queries para validar a migração:

```sql
-- 1. Verificar total de assinaturas criadas
SELECT COUNT(*) as total_subscriptions FROM subscriptions;

-- 2. Verificar assinaturas por status
SELECT status, COUNT(*) 
FROM subscriptions 
GROUP BY status;

-- 3. Verificar pagamentos vinculados
SELECT 
  COUNT(*) FILTER (WHERE subscription_id IS NOT NULL) as vinculados,
  COUNT(*) FILTER (WHERE subscription_id IS NULL AND plan_name IS NOT NULL) as nao_vinculados
FROM payments;

-- 4. Verificar integridade dos dados
SELECT 
  s.id,
  c.name as customer_name,
  p.name as plan_name,
  s.status,
  s.amount
FROM subscriptions s
JOIN companies c ON c.id = s.customer_id
JOIN plans p ON p.id = s.plan_id
LIMIT 10;
```

## 🎯 Composables Criados

### Frontend (Nuxt 3)

1. **useCustomers.ts**
   - Gerencia clientes (CRUD completo)
   - Busca e filtros
   - Atualização de tags

2. **useSubscriptionsManager.ts**
   - Gerencia assinaturas (CRUD completo)
   - Cancelamento e suspensão
   - Reativação
   - Toggle de cobrança automática

3. **usePlans.ts** (já existia)
   - Gerencia planos

## 📱 Páginas Atualizadas

- `/clientes` - Gestão de clientes (renomeado de /ajustes?tab=empresas)
- `/assinaturas` - Gestão de assinaturas com novo modal
- Modal `KSubscriptionModal` - Criação de assinaturas com autocomplete

## ⚠️ Pontos de Atenção

1. **Backup**: Sempre faça backup antes de executar a migração
2. **Dados Órfãos**: Pagamentos sem plan_name não serão migrados
3. **Duplicatas**: O script evita criar assinaturas duplicadas
4. **RLS**: As policies são criadas automaticamente
5. **Índices**: Criados para otimizar performance

## 🔧 Troubleshooting

### Erro: "relation subscriptions already exists"
- A tabela já foi criada. Pule o passo de criação.

### Erro: "foreign key violation"
- Verifique se as tabelas companies e plans existem
- Verifique se há dados órfãos

### Pagamentos não vinculados
- Execute novamente a query de vinculação:
```sql
UPDATE payments p
SET subscription_id = s.id
FROM subscriptions s
INNER JOIN plans pl ON pl.id = s.plan_id
WHERE p.company_id = s.customer_id
  AND p.plan_name = pl.name
  AND p.subscription_id IS NULL;
```

## 📞 Suporte

Se encontrar problemas durante a migração:
1. Verifique os logs do Supabase
2. Execute as queries de validação
3. Revise o relatório de migração gerado automaticamente
