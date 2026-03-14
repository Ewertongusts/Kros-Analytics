# FASE 1: Preparação do Banco de Dados - Instruções SQL

## 📋 Resumo
Criar 3 novas tabelas para separar conceitos:
- `expenses` - Despesas cadastradas (recorrentes ou únicas)
- `expense_occurrences` - Instâncias/ocorrências de despesas
- `payment_records` - Registros de pagamentos realizados

---

## 🔧 Passo 1: Criar Tabela `expenses`

Execute no Supabase SQL Editor:

```sql
-- Criar tabela expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  
  -- Tipo de despesa
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'yearly'
  
  -- Período de validade
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = sem fim
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadados
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_is_recurring ON expenses(is_recurring);
CREATE INDEX IF NOT EXISTS idx_expenses_is_active ON expenses(is_active);

-- Habilitar RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🔧 Passo 2: Criar Tabela `expense_occurrences`

```sql
-- Criar tabela expense_occurrences
CREATE TABLE IF NOT EXISTS expense_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Período da ocorrência
  occurrence_date DATE NOT NULL, -- Mês/período (ex: 2024-02-01)
  due_date DATE NOT NULL, -- Data de vencimento
  
  -- Valor (pode diferir da despesa original)
  amount NUMERIC NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  
  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_expense_occurrences_user_id ON expense_occurrences(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_occurrences_expense_id ON expense_occurrences(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_occurrences_status ON expense_occurrences(status);
CREATE INDEX IF NOT EXISTS idx_expense_occurrences_due_date ON expense_occurrences(due_date);

-- Habilitar RLS
ALTER TABLE expense_occurrences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own occurrences"
  ON expense_occurrences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create occurrences"
  ON expense_occurrences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own occurrences"
  ON expense_occurrences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own occurrences"
  ON expense_occurrences FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🔧 Passo 3: Criar Tabela `payment_records`

```sql
-- Criar tabela payment_records
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_occurrence_id UUID NOT NULL REFERENCES expense_occurrences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informações do pagamento
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT, -- 'debit', 'credit', 'transfer', 'cash', 'check', etc
  
  -- Metadados
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_expense_occurrence_id ON payment_records(expense_occurrence_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_date ON payment_records(payment_date);

-- Habilitar RLS
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own payment records"
  ON payment_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payment records"
  ON payment_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment records"
  ON payment_records FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🔧 Passo 4: Migração de Dados (Opcional - Se tiver dados em `transactions`)

Se você tem dados em `transactions` que quer migrar:

```sql
-- Backup das tabelas antigas (RECOMENDADO)
CREATE TABLE transactions_backup AS SELECT * FROM transactions;
CREATE TABLE payment_history_backup AS SELECT * FROM payment_history;

-- Migrar dados de transactions para expenses
INSERT INTO expenses (user_id, description, category_id, amount, is_recurring, recurring_frequency, start_date, end_date, is_active, notes, created_at, updated_at)
SELECT 
  user_id,
  description,
  category_id,
  amount,
  is_recurring,
  recurring_frequency,
  COALESCE(due_date::date, NOW()::date),
  NULL,
  true,
  notes,
  created_at,
  updated_at
FROM transactions
WHERE status = 'pending' OR status IS NULL;

-- Migrar dados de payment_history para payment_records
-- NOTA: Isso requer que expense_occurrences já existam
-- Por enquanto, vamos apenas fazer backup
```

---

## ✅ Checklist de Execução

- [ ] Executar Passo 1 (tabela `expenses`)
- [ ] Executar Passo 2 (tabela `expense_occurrences`)
- [ ] Executar Passo 3 (tabela `payment_records`)
- [ ] Verificar que as tabelas foram criadas no Supabase
- [ ] Testar RLS policies (tentar acessar dados de outro usuário - deve falhar)
- [ ] Fazer backup das tabelas antigas (Passo 4 - opcional)

---

## 🚀 Próximos Passos

Após criar as tabelas:

1. **FASE 2**: Criar funções de banco de dados para gerar ocorrências automaticamente
2. **FASE 3**: Refatorar composables para usar nova estrutura
3. **FASE 4**: Atualizar componentes para trabalhar com ocorrências

---

## 📝 Notas Importantes

- **RLS Policies**: Garantem que cada usuário veja apenas seus próprios dados
- **Índices**: Melhoram performance de queries
- **Backup**: Sempre faça backup antes de migrar dados
- **Testes**: Teste as RLS policies antes de usar em produção

---

**Status**: Pronto para execução
**Complexidade**: Baixa (apenas SQL)
**Tempo Estimado**: 5-10 minutos
