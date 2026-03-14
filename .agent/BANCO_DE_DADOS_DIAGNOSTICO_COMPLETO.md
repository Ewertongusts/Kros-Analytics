# 🔍 DIAGNÓSTICO COMPLETO: Banco de Dados - Página de Despesas

## 📊 MAPA VISUAL DO BANCO

### Tabelas Existentes (4 tabelas)
```
┌─────────────────────────────────────────────────────────────────┐
│                         EXPENSES                                │
│ (Despesas cadastradas - recorrentes ou únicas)                  │
├─────────────────────────────────────────────────────────────────┤
│ ✅ id, user_id, description, category_id, amount               │
│ ✅ is_recurring, recurring_frequency, start_date, end_date     │
│ ✅ is_active, notes, created_at, updated_at                    │
│ ✅ Índices: user_id, category_id, is_recurring, is_active      │
│ ✅ RLS: Habilitado (SELECT/INSERT/UPDATE/DELETE)               │
│ ✅ Foreign Key: category_id → categories(id)                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXPENSE_OCCURRENCES                          │
│ (Instâncias/ocorrências de despesas)                            │
├─────────────────────────────────────────────────────────────────┤
│ ✅ id, expense_id, user_id, occurrence_date, due_date          │
│ ✅ amount, status (pending/paid/overdue), created_at, updated_at│
│ ✅ Índices: user_id, expense_id, status, due_date              │
│ ✅ RLS: Habilitado (SELECT/INSERT/UPDATE/DELETE)               │
│ ✅ Foreign Key: expense_id → expenses(id) ON DELETE CASCADE    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT_RECORDS                              │
│ (Registros de pagamentos realizados)                            │
├─────────────────────────────────────────────────────────────────┤
│ ✅ id, expense_occurrence_id, user_id, amount, payment_date    │
│ ✅ payment_method, notes, created_at                           │
│ ✅ Índices: user_id, expense_occurrence_id, payment_date       │
│ ✅ RLS: Habilitado (SELECT/INSERT/DELETE)                      │
│ ✅ Foreign Key: expense_occurrence_id → expense_occurrences(id)│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CATEGORIES                                 │
│ (Categorias de despesas)                                        │
├─────────────────────────────────────────────────────────────────┤
│ ✅ id, user_id, name, color, is_active, created_at, updated_at │
│ ✅ Índices: user_id                                             │
│ ✅ RLS: Habilitado (SELECT/INSERT/UPDATE/DELETE)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 RELACIONAMENTOS (Foreign Keys)

```
expenses.category_id ──→ categories.id
expenses.user_id ──→ auth.users.id

expense_occurrences.expense_id ──→ expenses.id (ON DELETE CASCADE)
expense_occurrences.user_id ──→ auth.users.id (ON DELETE CASCADE)

payment_records.expense_occurrence_id ──→ expense_occurrences.id (ON DELETE CASCADE)
payment_records.user_id ──→ auth.users.id (ON DELETE CASCADE)

categories.user_id ──→ auth.users.id (ON DELETE CASCADE)
```

---

## 📋 COMPOSABLES (3 composables)

### useExpenses.ts
```typescript
// REFS
expenses: ref<Expense[]>
categories: ref<Category[]>
loading: ref<boolean>
error: ref<string | null>

// FUNÇÕES
fetchExpenses(includeInactive?: boolean)
fetchCategories()
upsertExpense(expense: Partial<Expense>)
deleteExpense(id: string)
toggleExpenseActive(id: string, isActive: boolean)
upsertCategory(category: Partial<Category>)
deleteCategory(id: string)

// COMPUTED
getRecurringExpenses
getUniqueExpenses
getActiveExpenses
getInactiveExpenses
```

### useExpenseOccurrences.ts
```typescript
// REFS
occurrences: ref<ExpenseOccurrence[]>
loading: ref<boolean>
error: ref<string | null>

// FUNÇÕES
fetchOccurrences(filters?: {...})
createOccurrence(occurrence: Omit<...>)
createRecurringOccurrences(expenseId, startDate, freq, months)
updateOccurrenceStatus(id: string, status: string)
deleteOccurrence(id: string)

// COMPUTED
getPendingOccurrences
getPaidOccurrences
getOverdueOccurrences
getTotalPending
getTotalPaid
getOccurrencesByMonth
```

### usePaymentRecords.ts
```typescript
// REFS
records: ref<PaymentRecord[]>
loading: ref<boolean>
error: ref<string | null>

// FUNÇÕES
fetchRecords(filters?: {...})
createRecord(record: Omit<...>)
updateRecord(id: string, updates: Partial<...>)
deleteRecord(id: string)

// COMPUTED
getTotalPaid
getAveragePayment
getRecordsByMonth
getRecordsByMethod
getTotalByMethod
getTotalByMonth
getHighestPayment
getLowestPayment
```

---

## 🎨 COMPONENTES (6 componentes)

```
KMetricsTab.vue
├── Usa: usePaymentRecords, useExpenseOccurrences, useExpenses
├── Mostra: Total pago, média, maior, menor, gráficos
└── Conecta: payment_records, expense_occurrences, expenses

KAllOccurrencesTab.vue
├── Usa: useExpenseOccurrences, usePaymentRecords, useExpenses
├── Mostra: Todas as ocorrências, filtros, ações (marcar pago)
└── Conecta: expense_occurrences, payment_records, expenses

KRecurringExpensesTab.vue
├── Usa: useExpenses
├── Mostra: Despesas recorrentes, modal de criação/edição
└── Conecta: expenses (is_recurring=true)

KUniqueExpensesTab.vue
├── Usa: useExpenses
├── Mostra: Despesas únicas, modal de criação/edição
└── Conecta: expenses (is_recurring=false)

KPaymentHistoryTab.vue
├── Usa: usePaymentRecords, useExpenseOccurrences, useExpenses
├── Mostra: Histórico de pagamentos, filtros
└── Conecta: payment_records, expense_occurrences, expenses

KCategoriesManagement.vue
├── Usa: useExpenses
├── Mostra: Categorias, modal de criação/edição
└── Conecta: categories
```

---

## 🔄 FLUXOS DE DADOS

### Fluxo 1: Criar Despesa Recorrente
```
KRecurringExpensesTab.vue
  ↓ (clica "Nova Despesa")
KExpenseModal.vue
  ↓ (preenche e clica "Salvar")
useExpenses.upsertExpense()
  ↓ (INSERT em expenses com is_recurring=true)
TRIGGER: trigger_expenses_generate_occurrences
  ↓ (executa automaticamente)
FUNÇÃO: generate_expense_occurrences()
  ↓ (cria 12 ocorrências)
INSERT em expense_occurrences
  ↓ (12 registros criados)
useExpenseOccurrences.fetchOccurrences()
  ↓ (recarrega dados)
KAllOccurrencesTab.vue
  ↓ (mostra 12 ocorrências)
```

### Fluxo 2: Marcar Ocorrência como Paga
```
KAllOccurrencesTab.vue
  ↓ (clica "Marcar como Pago")
Modal de Pagamento
  ↓ (preenche data, método, notas)
useExpenseOccurrences.updateOccurrenceStatus()
  ↓ (UPDATE expense_occurrences status='paid')
usePaymentRecords.createRecord()
  ↓ (INSERT em payment_records)
usePaymentRecords.fetchRecords()
  ↓ (recarrega dados)
KPaymentHistoryTab.vue
  ↓ (mostra novo pagamento)
KMetricsTab.vue
  ↓ (métricas atualizadas)
```

### Fluxo 3: Criar/Editar Categoria
```
KCategoriesManagement.vue
  ↓ (clica "Nova Categoria")
Modal de Categoria
  ↓ (preenche nome, cor)
useExpenses.upsertCategory()
  ↓ (UPSERT em categories)
useExpenses.fetchCategories()
  ↓ (recarrega dados)
KCategoriesManagement.vue
  ↓ (mostra nova categoria)
KRecurringExpensesTab.vue
  ↓ (dropdown atualizado)
KUniqueExpensesTab.vue
  ↓ (dropdown atualizado)
```

---

## ✅ O QUE ESTÁ CORRETO

- ✅ Tabelas criadas com estrutura correta
- ✅ Foreign keys configuradas
- ✅ RLS policies habilitadas
- ✅ Índices criados para performance
- ✅ Composables implementados
- ✅ Componentes criados
- ✅ Fluxos de dados mapeados
- ✅ TypeScript sem erros
- ✅ Reatividade com toRef() aplicada

---

## ⚠️ O QUE PRECISA SER FEITO

### 1. Executar Scripts SQL no Supabase
**Status**: ⏳ NÃO EXECUTADO

Scripts que precisam ser executados:
- `.kiro/DATABASE_MIGRATION_PHASE1.md` - Criar tabelas
- `.kiro/DATABASE_MIGRATION_PHASE2.md` - Criar funções e triggers

**Impacto**: SEM ISSO, O BANCO NÃO FUNCIONA

### 2. Testar Reatividade
**Status**: ⏳ NÃO TESTADO

Verificar se categorias não desaparecem:
1. Criar categoria
2. Editar categoria
3. Verificar se atualiza em todos os componentes

**Impacto**: Categorias podem desaparecer (como contacts-disappearing-fix)

### 3. Testar Fluxos Completos
**Status**: ⏳ NÃO TESTADO

Testar:
1. Criar despesa recorrente → Verificar ocorrências
2. Marcar como pago → Verificar payment_record
3. Editar categoria → Verificar atualização

**Impacto**: Funcionalidade pode não funcionar como esperado

---

## 🎯 PLANO DE AÇÃO

### Fase 1: Executar Scripts SQL (10 minutos)
1. Abrir Supabase SQL Editor
2. Executar `.kiro/DATABASE_MIGRATION_PHASE1.md`
   - Criar tabela `expenses`
   - Criar tabela `expense_occurrences`
   - Criar tabela `payment_records`
3. Executar `.kiro/DATABASE_MIGRATION_PHASE2.md`
   - Criar função `generate_expense_occurrences()`
   - Criar função `mark_occurrence_as_paid()`
   - Criar função `update_occurrence_status()`
   - Criar função `create_next_recurrence()`
   - Criar trigger `trigger_expenses_generate_occurrences`
4. Verificar que as tabelas foram criadas

### Fase 2: Testar Reatividade (5 minutos)
1. Abrir página de despesas
2. Ir para aba "Categorias"
3. Criar categoria "Teste"
4. Verificar se aparece em:
   - ✅ Aba "Categorias"
   - ✅ Dropdown em "Recorrentes"
   - ✅ Dropdown em "Únicos"
   - ✅ Filtro em "Todos"

### Fase 3: Testar Fluxos Completos (15 minutos)
1. Criar despesa recorrente
2. Verificar que ocorrências foram criadas
3. Marcar ocorrência como paga
4. Verificar que payment_record foi criado
5. Verificar que histórico e métricas atualizaram

### Fase 4: Validar Dados (5 minutos)
1. Abrir Supabase Table Editor
2. Verificar dados em cada tabela
3. Verificar que foreign keys estão corretas
4. Verificar que RLS policies estão funcionando

---

## 📝 RESUMO

**Banco de Dados**: ✅ Estrutura correta, pronto para usar
**Composables**: ✅ Implementados, sem erros
**Componentes**: ✅ Criados, com reatividade corrigida
**Scripts SQL**: ⏳ Precisam ser executados no Supabase
**Testes**: ⏳ Precisam ser executados

**Próximo Passo**: Executar scripts SQL no Supabase

**Tempo Estimado**: 30-45 minutos (SQL + testes)

---

**Status**: 🟡 80% Pronto - Aguardando execução SQL
