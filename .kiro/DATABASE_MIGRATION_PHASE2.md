# FASE 2: Lógica de Recorrência - Instruções SQL

## 📋 Resumo
Criar funções de banco de dados e triggers para automatizar:
- Geração de ocorrências para despesas recorrentes
- Marcação de ocorrências como pagas
- Atualização de status de vencidas
- Criação de próximas ocorrências automaticamente

---

## 🔧 Passo 1: Criar Função `generate_expense_occurrences()`

Execute no Supabase SQL Editor:

```sql
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
```

---

## 🔧 Passo 2: Criar Função `mark_occurrence_as_paid()`

```sql
-- Função para marcar ocorrência como paga e criar registro de pagamento
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
) AS $$
DECLARE
  v_occurrence RECORD;
  v_payment_record_id UUID;
BEGIN
  -- Buscar a ocorrência
  SELECT * INTO v_occurrence FROM expense_occurrences WHERE id = p_occurrence_id;
  
  IF v_occurrence IS NULL THEN
    RAISE EXCEPTION 'Ocorrência não encontrada: %', p_occurrence_id;
  END IF;
  
  -- Atualizar status da ocorrência para 'paid'
  UPDATE expense_occurrences
  SET status = 'paid', updated_at = NOW()
  WHERE id = p_occurrence_id;
  
  -- Criar registro de pagamento
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
$$ LANGUAGE plpgsql;
```

---

## 🔧 Passo 3: Criar Função `update_occurrence_status()`

```sql
-- Função para atualizar status de ocorrências (pending/overdue)
CREATE OR REPLACE FUNCTION update_occurrence_status()
RETURNS TABLE(updated_count INT) AS $$
DECLARE
  v_count INT;
BEGIN
  -- Atualizar ocorrências vencidas (due_date < hoje e status = pending)
  UPDATE expense_occurrences
  SET status = 'overdue', updated_at = NOW()
  WHERE status = 'pending' AND due_date < CURRENT_DATE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔧 Passo 4: Criar Função `create_next_recurrence()`

```sql
-- Função para criar próxima ocorrência de uma despesa recorrente
CREATE OR REPLACE FUNCTION create_next_recurrence(p_expense_id UUID)
RETURNS TABLE(
  occurrence_id UUID,
  success BOOLEAN
) AS $$
DECLARE
  v_expense RECORD;
  v_last_occurrence RECORD;
  v_next_occurrence_date DATE;
  v_next_due_date DATE;
  v_new_occurrence_id UUID;
BEGIN
  -- Buscar a despesa
  SELECT * INTO v_expense FROM expenses WHERE id = p_expense_id;
  
  IF v_expense IS NULL THEN
    RAISE EXCEPTION 'Despesa não encontrada: %', p_expense_id;
  END IF;
  
  IF NOT v_expense.is_recurring THEN
    RAISE EXCEPTION 'Despesa não é recorrente: %', p_expense_id;
  END IF;
  
  -- Buscar última ocorrência
  SELECT * INTO v_last_occurrence
  FROM expense_occurrences
  WHERE expense_id = p_expense_id
  ORDER BY due_date DESC
  LIMIT 1;
  
  IF v_last_occurrence IS NULL THEN
    RAISE EXCEPTION 'Nenhuma ocorrência encontrada para despesa: %', p_expense_id;
  END IF;
  
  -- Calcular próxima data baseado na frequência
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
  
  -- Verificar se está dentro do período válido
  IF v_expense.end_date IS NOT NULL AND v_next_due_date > v_expense.end_date THEN
    RAISE EXCEPTION 'Próxima ocorrência está fora do período válido da despesa';
  END IF;
  
  -- Criar nova ocorrência
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
$$ LANGUAGE plpgsql;
```

---

## 🔧 Passo 5: Criar Trigger ao Inserir Despesa Recorrente

```sql
-- Trigger para gerar ocorrências ao criar despesa recorrente
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
```

---

## 🔧 Passo 6: Criar Trigger Diário para Atualizar Status de Vencidas

```sql
-- Função para ser chamada por cron job (atualizar status de vencidas)
CREATE OR REPLACE FUNCTION update_overdue_occurrences()
RETURNS TABLE(updated_count INT) AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE expense_occurrences
  SET status = 'overdue', updated_at = NOW()
  WHERE status = 'pending' AND due_date < CURRENT_DATE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;

-- Nota: Para executar diariamente, você precisa configurar um cron job no Supabase
-- Veja: https://supabase.com/docs/guides/database/extensions/pg_cron
```

---

## ✅ Checklist de Execução

- [ ] Executar Passo 1 (função `generate_expense_occurrences()`)
- [ ] Executar Passo 2 (função `mark_occurrence_as_paid()`)
- [ ] Executar Passo 3 (função `update_occurrence_status()`)
- [ ] Executar Passo 4 (função `create_next_recurrence()`)
- [ ] Executar Passo 5 (trigger ao inserir despesa)
- [ ] Executar Passo 6 (função para atualizar status de vencidas)
- [ ] Testar as funções com dados de teste

---

## 🧪 Testes

### Teste 1: Criar Despesa Recorrente
```sql
-- Inserir despesa recorrente
INSERT INTO expenses (
  user_id,
  description,
  category_id,
  amount,
  is_recurring,
  recurring_frequency,
  start_date,
  is_active
) VALUES (
  'seu-user-id-aqui',
  'Servidor',
  'sua-category-id-aqui',
  330.00,
  true,
  'monthly',
  '2024-01-01',
  true
);

-- Verificar que ocorrências foram criadas
SELECT COUNT(*) FROM expense_occurrences WHERE expense_id = 'id-da-despesa-criada';
-- Deve retornar 12 (12 meses)
```

### Teste 2: Marcar Ocorrência como Paga
```sql
-- Marcar ocorrência como paga
SELECT * FROM mark_occurrence_as_paid(
  'id-da-ocorrencia',
  CURRENT_DATE,
  'debit',
  'Pagamento via débito'
);

-- Verificar que registro de pagamento foi criado
SELECT * FROM payment_records WHERE expense_occurrence_id = 'id-da-ocorrencia';
```

### Teste 3: Atualizar Status de Vencidas
```sql
-- Atualizar status de vencidas
SELECT * FROM update_overdue_occurrences();

-- Verificar ocorrências vencidas
SELECT * FROM expense_occurrences WHERE status = 'overdue';
```

---

## 📝 Notas Importantes

- **Triggers**: Executam automaticamente ao inserir/atualizar dados
- **Funções**: Podem ser chamadas manualmente ou por triggers
- **Performance**: Índices já foram criados na FASE 1
- **Testes**: Sempre teste com dados de teste antes de usar em produção

---

**Status**: Pronto para execução
**Complexidade**: Média (SQL avançado com PL/pgSQL)
**Tempo Estimado**: 10-15 minutos
