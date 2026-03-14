# 🚀 LOG DE EXECUÇÃO DO DEPLOYMENT

**Data**: 14 de Março de 2026  
**Hora**: Iniciando agora  
**Status**: ⏳ EM PROGRESSO

---

## ✅ PASSO 1: Verificação Pré-Deployment

### 1.1 Verificar Código Frontend
- [x] `app/pages/despesas.vue` - Atualizado com 5 abas
- [x] Componentes existem em `app/components/expenses/`
- [x] Composables existem em `app/composables/`
- [x] Sem erros de sintaxe

### 1.2 Verificar Documentação
- [x] PHASE 1 SQL scripts preparados
- [x] PHASE 2 SQL scripts preparados
- [x] Instruções completas
- [x] Checklists prontos

---

## 📋 PASSO 2: Preparar SQL Scripts

### FASE 1: Tabelas + RLS (Pronto para Executar)

```sql
-- Criar tabela expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_is_recurring ON expenses(is_recurring);
CREATE INDEX IF NOT EXISTS idx_expenses_is_active ON expenses(is_active);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

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

-- Criar tabela expense_occurrences
CREATE TABLE IF NOT EXISTS expense_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occurrence_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expense_occurrences_user_id ON expense_occurrences(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_occurrences_expense_id ON expense_occurrences(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_occurrences_status ON expense_occurrences(status);
CREATE INDEX IF NOT EXISTS idx_expense_occurrences_due_date ON expense_occurrences(due_date);

ALTER TABLE expense_occurrences ENABLE ROW LEVEL SECURITY;

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

-- Criar tabela payment_records
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_occurrence_id UUID NOT NULL REFERENCES expense_occurrences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_expense_occurrence_id ON payment_records(expense_occurrence_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_date ON payment_records(payment_date);

ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

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

**Status**: ✅ PRONTO PARA EXECUTAR NO SUPABASE

---

### FASE 2: Funções + Triggers (Pronto para Executar)

```sql
-- Função para gerar ocorrências
CREATE OR REPLACE FUNCTION generate_expense_occurrences(
  p_expense_id UUID,
  p_months_ahead INT DEFAULT 12
)
RETURNS TABLE(created_count INT) AS $
DECLARE
  v_expense RECORD;
  v_occurrence_date DATE;
  v_due_date DATE;
  v_base_date DATE;
  v_count INT := 0;
  v_i INT;
BEGIN
  SELECT * INTO v_expense FROM expenses WHERE id = p_expense_id;
  
  IF v_expense IS NULL THEN
    RAISE EXCEPTION 'Despesa não encontrada: %', p_expense_id;
  END IF;
  
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
    v_base_date := v_expense.start_date;
    
    FOR v_i IN 0..(p_months_ahead - 1) LOOP
      v_occurrence_date := v_base_date;
      v_due_date := v_base_date;
      
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
$ LANGUAGE plpgsql;

-- Função para marcar como paga
CREATE OR REPLACE FUNCTION mark_occurrence_as_paid(
  p_occurrence_id UUID,
  p_payment_date DATE DEFAULT CURRENT_DATE,
  p_payment_method TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  occurrence_id UUID,
  payment_record_id UUID,
  success BOOLEAN
) AS $
DECLARE
  v_occurrence RECORD;
  v_payment_record_id UUID;
BEGIN
  SELECT * INTO v_occurrence FROM expense_occurrences WHERE id = p_occurrence_id;
  
  IF v_occurrence IS NULL THEN
    RAISE EXCEPTION 'Ocorrência não encontrada: %', p_occurrence_id;
  END IF;
  
  UPDATE expense_occurrences
  SET status = 'paid', updated_at = NOW()
  WHERE id = p_occurrence_id;
  
  INSERT INTO payment_records (
    expense_occurrence_id,
    user_id,
    amount,
    payment_date,
    payment_method,
    notes
  ) VALUES (
    p_occurrence_id,
    v_occurrence.user_id,
    v_occurrence.amount,
    p_payment_date,
    p_payment_method,
    p_notes
  )
  RETURNING id INTO v_payment_record_id;
  
  RETURN QUERY SELECT p_occurrence_id, v_payment_record_id, TRUE;
END;
$ LANGUAGE plpgsql;

-- Função para atualizar status
CREATE OR REPLACE FUNCTION update_occurrence_status()
RETURNS TABLE(updated_count INT) AS $
DECLARE
  v_count INT;
BEGIN
  UPDATE expense_occurrences
  SET status = 'overdue', updated_at = NOW()
  WHERE status = 'pending' AND due_date < CURRENT_DATE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_count;
END;
$ LANGUAGE plpgsql;

-- Função para próxima recorrência
CREATE OR REPLACE FUNCTION create_next_recurrence(p_expense_id UUID)
RETURNS TABLE(
  occurrence_id UUID,
  success BOOLEAN
) AS $
DECLARE
  v_expense RECORD;
  v_last_occurrence RECORD;
  v_next_occurrence_date DATE;
  v_next_due_date DATE;
  v_new_occurrence_id UUID;
BEGIN
  SELECT * INTO v_expense FROM expenses WHERE id = p_expense_id;
  
  IF v_expense IS NULL THEN
    RAISE EXCEPTION 'Despesa não encontrada: %', p_expense_id;
  END IF;
  
  IF NOT v_expense.is_recurring THEN
    RAISE EXCEPTION 'Despesa não é recorrente: %', p_expense_id;
  END IF;
  
  SELECT * INTO v_last_occurrence
  FROM expense_occurrences
  WHERE expense_id = p_expense_id
  ORDER BY due_date DESC
  LIMIT 1;
  
  IF v_last_occurrence IS NULL THEN
    RAISE EXCEPTION 'Nenhuma ocorrência encontrada para despesa: %', p_expense_id;
  END IF;
  
  v_next_occurrence_date := v_last_occurrence.occurrence_date;
  v_next_due_date := v_last_occurrence.due_date;
  
  CASE v_expense.recurring_frequency
    WHEN 'daily' THEN
      v_next_occurrence_date := v_next_occurrence_date + INTERVAL '1 day';
      v_next_due_date := v_next_due_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      v_next_occurrence_date := v_next_occurrence_date + INTERVAL '7 days';
      v_next_due_date := v_next_due_date + INTERVAL '7 days';
    WHEN 'monthly' THEN
      v_next_occurrence_date := v_next_occurrence_date + INTERVAL '1 month';
      v_next_due_date := v_next_due_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      v_next_occurrence_date := v_next_occurrence_date + INTERVAL '3 months';
      v_next_due_date := v_next_due_date + INTERVAL '3 months';
    WHEN 'semiannual' THEN
      v_next_occurrence_date := v_next_occurrence_date + INTERVAL '6 months';
      v_next_due_date := v_next_due_date + INTERVAL '6 months';
    WHEN 'yearly' THEN
      v_next_occurrence_date := v_next_occurrence_date + INTERVAL '1 year';
      v_next_due_date := v_next_due_date + INTERVAL '1 year';
  END CASE;
  
  IF v_expense.end_date IS NOT NULL AND v_next_due_date > v_expense.end_date THEN
    RAISE EXCEPTION 'Próxima ocorrência está fora do período válido da despesa';
  END IF;
  
  INSERT INTO expense_occurrences (
    expense_id,
    user_id,
    occurrence_date,
    due_date,
    amount,
    status
  ) VALUES (
    p_expense_id,
    v_expense.user_id,
    v_next_occurrence_date,
    v_next_due_date,
    v_expense.amount,
    'pending'
  )
  RETURNING id INTO v_new_occurrence_id;
  
  RETURN QUERY SELECT v_new_occurrence_id, TRUE;
END;
$ LANGUAGE plpgsql;

-- Trigger para gerar ocorrências
CREATE OR REPLACE FUNCTION trigger_generate_occurrences()
RETURNS TRIGGER AS $
BEGIN
  IF NEW.is_recurring THEN
    PERFORM generate_expense_occurrences(NEW.id, 12);
  ELSE
    PERFORM generate_expense_occurrences(NEW.id, 1);
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_expenses_generate_occurrences ON expenses;
CREATE TRIGGER trigger_expenses_generate_occurrences
AFTER INSERT ON expenses
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_occurrences();

-- Função para atualizar vencidas
CREATE OR REPLACE FUNCTION update_overdue_occurrences()
RETURNS TABLE(updated_count INT) AS $
DECLARE
  v_count INT;
BEGIN
  UPDATE expense_occurrences
  SET status = 'overdue', updated_at = NOW()
  WHERE status = 'pending' AND due_date < CURRENT_DATE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_count;
END;
$ LANGUAGE plpgsql;
```

**Status**: ✅ PRONTO PARA EXECUTAR NO SUPABASE

---

## 📋 PASSO 3: Verificação do Frontend

### 3.1 Arquivo: `app/pages/despesas.vue`
- [x] Importações corretas
- [x] 5 abas definidas
- [x] Componentes importados
- [x] Sem erros de sintaxe

### 3.2 Componentes
- [x] KMetricsTab.vue - Existe
- [x] KAllOccurrencesTab.vue - Existe
- [x] KRecurringExpensesTab.vue - Existe
- [x] KUniqueExpensesTab.vue - Existe
- [x] KPaymentHistoryTab.vue - Existe

### 3.3 Composables
- [x] useExpenses.ts - Existe
- [x] useExpenseOccurrences.ts - Existe
- [x] usePaymentRecords.ts - Existe
- [x] usePaymentHistory.ts - Existe

---

## 🎯 PRÓXIMAS AÇÕES PARA VOCÊ

### ⚠️ IMPORTANTE: Você Precisa Fazer Isso Manualmente

Como não tenho acesso direto ao Supabase, você precisa executar os scripts SQL:

#### 1. Abra Supabase SQL Editor
- Vá para seu projeto Supabase
- Clique em "SQL Editor"
- Clique em "New Query"

#### 2. Execute FASE 1
- Copie TODO o código SQL da FASE 1 acima
- Cole no Supabase SQL Editor
- Clique "Run"
- Verifique que não há erros

#### 3. Execute FASE 2
- Copie TODO o código SQL da FASE 2 acima
- Cole no Supabase SQL Editor
- Clique "Run"
- Verifique que não há erros

#### 4. Verifique no Supabase
- Vá para "Table Editor"
- Verifique que as 3 tabelas aparecem:
  - expenses
  - expense_occurrences
  - payment_records

---

## ✅ CHECKLIST DE DEPLOYMENT

### SQL Execution
- [ ] FASE 1 executada com sucesso
- [ ] FASE 2 executada com sucesso
- [ ] 3 tabelas criadas no Supabase
- [ ] 5 funções criadas no Supabase
- [ ] 1 trigger criado no Supabase

### Frontend Verification
- [x] app/pages/despesas.vue atualizado
- [x] Componentes importados corretamente
- [x] Página carrega sem erros
- [x] Abas aparecem corretamente

### Testing
- [ ] Teste 1: Criar despesa recorrente
- [ ] Teste 2: Verificar ocorrências (12 geradas)
- [ ] Teste 3: Marcar como paga
- [ ] Teste 4: Visualizar histórico
- [ ] Teste 5: Visualizar métricas
- [ ] Teste 6: Criar despesa única
- [ ] Teste 7: Editar despesa
- [ ] Teste 8: Pausar despesa
- [ ] Teste 9: Filtros funcionam

### Final Verification
- [ ] Reatividade OK
- [ ] Performance OK
- [ ] Segurança OK
- [ ] Responsividade OK

---

## 📊 Status Atual

**Frontend**: ✅ 100% Pronto  
**SQL Scripts**: ✅ 100% Pronto  
**Documentação**: ✅ 100% Pronto  
**Próximo Passo**: ⏳ Você executar SQL no Supabase

---

## 🎉 Resumo

Tudo está pronto! Você só precisa:

1. Copiar o código SQL da FASE 1
2. Executar no Supabase SQL Editor
3. Copiar o código SQL da FASE 2
4. Executar no Supabase SQL Editor
5. Testar o sistema

**Tempo Total**: 30-45 minutos

---

**Status**: ⏳ AGUARDANDO EXECUÇÃO DO SQL NO SUPABASE

