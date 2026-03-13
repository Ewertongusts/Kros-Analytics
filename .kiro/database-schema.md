---
inclusion: auto
---

# Database Schema - Kros Analytics

Este arquivo documenta a estrutura completa do banco de dados Supabase.
Sempre consulte este arquivo antes de fazer queries ou modificações no banco.

## Tabela: companies (clientes/empresas)

Armazena informações de clientes/empresas do sistema.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  phone TEXT,
  document TEXT,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colunas:**
- `id` - UUID único do cliente
- `name` - Nome da empresa/cliente
- `email` - Email de contato
- `whatsapp` - WhatsApp no formato internacional (ex: 5511999999999)
- `phone` - Telefone formatado (ex: (11) 9999-9999)
- `document` - CNPJ ou CPF
- `tags` - JSONB array de tags para categorização (ex: ["VIP", "Premium"])
- `created_at` - Data de criação
- `updated_at` - Data de última atualização

**Relacionamentos:**
- `subscriptions.customer_id` → `companies.id`

---

## Tabela: plans (planos de assinatura)

Armazena os planos disponíveis para assinatura.

```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'Mensal',
  type TEXT DEFAULT 'Plano Recorrente',
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
```

**Colunas:**
- `id` - UUID único do plano
- `name` - Nome do plano
- `price` - Preço do plano
- `billing_cycle` - Ciclo de cobrança (Mensal, Anual, etc)
- `type` - Tipo do plano (Plano Recorrente, etc)
- `category` - Categoria do plano
- `description` - Descrição detalhada
- `created_at` - Data de criação
- `updated_at` - Data de última atualização

**Relacionamentos:**
- `subscriptions.plan_id` → `plans.id`

---

## Tabela: subscriptions (assinaturas)

Armazena as assinaturas ativas/inativas dos clientes.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES companies(id),
  plan_id UUID NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE,
  due_day INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  discount_percent NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  auto_billing_enabled BOOLEAN DEFAULT FALSE,
  auto_billing_message TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID
);
```

**Colunas:**
- `id` - UUID único da assinatura
- `customer_id` - FK para companies (cliente)
- `plan_id` - FK para plans (plano contratado)
- `status` - Status da assinatura: 'active', 'pending', 'trial', 'suspended', 'cancelled'
- `start_date` - Data de início da assinatura
- `end_date` - Data de término (null se ativa)
- `due_day` - Dia do vencimento (1-31)
- `amount` - Valor da assinatura
- `discount_percent` - Percentual de desconto
- `discount_amount` - Valor do desconto em reais
- `auto_billing_enabled` - Se cobrança automática está ativa
- `auto_billing_message` - Mensagem personalizada para cobrança
- `notes` - Observações internas
- `metadata` - Dados adicionais em JSON
- `created_at` - Data de criação
- `created_by` - UUID do usuário que criou
- `updated_at` - Data de última atualização
- `updated_by` - UUID do usuário que atualizou

**Relacionamentos:**
- `customer_id` → `companies.id`
- `plan_id` → `plans.id`

**Queries comuns:**
```sql
-- Buscar assinaturas com detalhes de cliente e plano
SELECT 
  s.*,
  c.name as customer_name,
  c.email as customer_email,
  p.name as plan_name,
  p.billing_cycle as plan_billing_cycle
FROM subscriptions s
JOIN companies c ON s.customer_id = c.id
JOIN plans p ON s.plan_id = p.id
WHERE s.status = 'active';
```

---

## Tabela: payment_history (histórico de ações)

Armazena o histórico de todas as ações realizadas no sistema.

```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID,
  company_id UUID,
  action_type TEXT NOT NULL,
  description TEXT,
  user_id UUID,
  user_name TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colunas:**
- `id` - UUID único do registro
- `payment_id` - ID do pagamento/assinatura relacionado
- `company_id` - ID da empresa relacionada
- `action_type` - Tipo de ação (subscription_deleted, payment_created, etc)
- `description` - Descrição da ação
- `user_id` - UUID do usuário que executou
- `user_name` - Nome do usuário
- `metadata` - Dados adicionais em JSON
- `created_at` - Data da ação

---

## Tabela: tags (definições de tags)

Armazena as definições de tags disponíveis no sistema.

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colunas:**
- `id` - UUID único da tag
- `name` - Nome da tag (único)
- `color` - Cor em hexadecimal (ex: #FF5733)
- `description` - Descrição da tag
- `created_at` - Data de criação

---

## Tabela: message_templates (templates de mensagem)

Armazena templates de mensagens para WhatsApp.

```sql
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Colunas:**
- `id` - UUID único do template
- `name` - Nome do template
- `content` - Conteúdo da mensagem com variáveis
- `variables` - Array de variáveis disponíveis
- `created_at` - Data de criação
- `updated_at` - Data de última atualização

---

## IMPORTANTE: Tabelas ANTIGAS (não usar mais)

### ❌ payments (DESCONTINUADA)
Esta tabela foi substituída por `subscriptions`. Não criar novos registros aqui.

---

## Regras de Negócio

1. **Clientes (companies)**
   - Um cliente pode ter múltiplas assinaturas
   - WhatsApp deve estar no formato internacional sem espaços
   - Tags são opcionais e podem ser múltiplas

2. **Assinaturas (subscriptions)**
   - Sempre vincular a um cliente (customer_id) e plano (plan_id)
   - Status possíveis: active, pending, trial, suspended, cancelled
   - due_day deve estar entre 1 e 31
   - Ao apagar, registrar no payment_history

3. **Histórico (payment_history)**
   - Sempre registrar ações importantes (criar, editar, apagar)
   - Incluir metadata com informações relevantes

---

## Migrations Recentes

### 2024-03 - Criação da tabela subscriptions
- Criada nova tabela `subscriptions` para separar conceito de assinaturas de pagamentos
- Migrados dados de `payments` para `subscriptions`
- Adicionados campos: customer_id, plan_id, status, auto_billing, etc

### 2024-03 - Atualização da tabela companies
- Adicionados campos: whatsapp, phone, document, tags
- Preparação para separação de clientes e empresas

---

## Como Atualizar Este Arquivo

Sempre que fizer alterações no banco de dados:
1. Execute a migration no Supabase
2. Atualize este arquivo com as mudanças
3. Documente a migration na seção "Migrations Recentes"
4. Atualize as queries comuns se necessário
