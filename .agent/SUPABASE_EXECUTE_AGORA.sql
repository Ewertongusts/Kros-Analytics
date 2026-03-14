-- ============================================================================
-- EXECUTE ESTE SCRIPT NO SUPABASE SQL EDITOR
-- ============================================================================
-- Este script vai:
-- 1. Deletar tabelas antigas (se existirem)
-- 2. Criar 3 tabelas novas: expenses, expense_occurrences, payment_records
-- 3. Criar índices para performance
-- 4. Habilitar RLS e criar policies
-- ============================================================================

-- PASSO 1: Deletar tabelas antigas (se existirem)
-- Isso vai deletar tudo, então cuidado!
DROP TABLE IF EXISTS payment_records CASCADE;
DROP TABLE IF EXISTS expense_occurrences CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;

-- ============================================================================
-- PASSO 2: Criar tabela EXPENSES
-- ============================================================================
CREATE TABLE expenses (
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

-- Criar índices
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_is_recurring ON expenses(is_recurring);
CREATE INDEX idx_expenses_is_active ON expenses(is_active);

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

-- ============================================================================
-- PASSO 3: Criar tabela EXPENSE_OCCURRENCES
-- ============================================================================
CREATE TABLE expense_occurrences (
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

-- Criar índices
CREATE INDEX idx_expense_occurrences_user_id ON expense_occurrences(user_id);
CREATE INDEX idx_expense_occurrences_expense_id ON expense_occurrences(expense_id);
CREATE INDEX idx_expense_occurrences_status ON expense_occurrences(status);
CREATE INDEX idx_expense_occurrences_due_date ON expense_occurrences(due_date);

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

-- ============================================================================
-- PASSO 4: Criar tabela PAYMENT_RECORDS
-- ============================================================================
CREATE TABLE payment_records (
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

-- Criar índices
CREATE INDEX idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX idx_payment_records_expense_occurrence_id ON payment_records(expense_occurrence_id);
CREATE INDEX idx_payment_records_payment_date ON payment_records(payment_date);

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

-- ============================================================================
-- PASSO 5: Criar FUNÇÕES
-- ============================================================================

-- Função para gerar ocorrências de despesas recorrentes
CREATE OR REPLACE FUNCTION generate_expense_occurrences(
  p_expense_id UUID,
  p_months_ahead INT DEFAULT 12
)
RETURNS TABLE(created_count INT) AS $$
DECLARE
  v_expense RECORD;
  v_occurrence_date DATE;
  v_due_date DATE;
  v_base_date DATE;
  v_count INT := 0;
  v_i INT;
BEGIN
  -- Buscar a despesa
  SELECT * INTO v_expense FROM expenses WHERE id = p_expense_id;
  
  IF v_expense IS NULL THEN
    RAISE EXCEPTION 'Despesa não encontrada: %', p_expense_id;
  END IF;
  
  -- Se não é recorrente, criar apenas uma ocorrência
  IF NOT v_expense.is_recurring THEN
    INSERT INTO expense_occurrences (
      expense_id, user_id, occurrence_date, due_date, amount, status
    ) VALUES (
      p_expense_id,
      v_expense.user_id,
      v_expense.start_date,
      v_expense.start_date,
      v_expense.amount,
      'pending'
    );
    v_count := 1;
  ELSE
    -- Gerar ocorrências para os próximos meses
    v_base_date := v_expense.start_date;
    
    FOR v_i IN 0..(p_months_ahead - 1) LOOP
      v_occurrence_date := v_base_date;
      v_due_date := v_base_date;
      
      -- Calcular próxima ocorrência baseado na frequência
      CASE v_expense.recurring_frequency
        WHEN 'daily' THEN
          v_occurrence_date := v_base_date + (v_i || ' days')::INTERVAL;
          v_due_date := v_base_date + (v_i || ' days')::INTERVAL;
        WHEN 'weekly' THEN
          v_occurrence_date := v_base_date + (v_i * 7 || ' days')::INTERVAL;
          v_due_date := v_base_date + (v_i * 7 || ' days')::INTERVAL;
        WHEN 'monthly' THEN
          v_occurrence_date := v_base_date + (v_i || ' months')::INTERVAL;
          v_due_date := v_base_date + (v_i || ' months')::INTERVAL;
        WHEN 'quarterly' THEN
          v_occurrence_date := v_base_date + (v_i * 3 || ' months')::INTERVAL;
          v_due_date := v_base_date + (v_i * 3 || ' months')::INTERVAL;
        WHEN 'semiannual' THEN
          v_occurrence_date := v_base_date + (v_i * 6 || ' months')::INTERVAL;
          v_due_date := v_base_date + (v_i * 6 || ' months')::INTERVAL;
        WHEN 'yearly' THEN
          v_occurrence_date := v_base_date + (v_i || ' years')::INTERVAL;
          v_due_date := v_base_date + (v_i || ' years')::INTERVAL;
      END CASE;
      
      -- Verificar se a ocorrência está dentro do período válido
      IF v_expense.end_date IS NULL OR v_due_date <= v_expense.end_date THEN
        INSERT INTO expense_occurrences (
          expense_id, user_id, occurrence_date, due_date, amount, status
        ) VALUES (
          p_expense_id,
          v_expense.user_id,
          v_occurrence_date::DATE,
          v_due_date::DATE,
          v_expense.amount,
          'pending'
        );
        v_count := v_count + 1;
      END IF;
    END LOOP;
  END IF;
  
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PASSO 6: Criar TRIGGER
-- ============================================================================

-- Função para ser chamada pelo trigger
CREATE OR REPLACE FUNCTION trigger_generate_occurrences()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_recurring THEN
    PERFORM generate_expense_occurrences(NEW.id, 12);
  ELSE
    PERFORM generate_expense_occurrences(NEW.id, 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_expenses_generate_occurrences ON expenses;
CREATE TRIGGER trigger_expenses_generate_occurrences
AFTER INSERT ON expenses
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_occurrences();

-- ============================================================================
-- ✅ PRONTO!
-- ============================================================================
-- Todas as tabelas, índices, RLS policies, funções e triggers foram criados!
-- Agora você pode:
-- 1. Criar despesas recorrentes
-- 2. Ocorrências serão geradas automaticamente
-- 3. Marcar como pago
-- 4. Ver histórico de pagamentos
-- ============================================================================
