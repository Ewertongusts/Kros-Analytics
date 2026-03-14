# Auditoria: Conexões com Banco de Dados - Página de Despesas

## 📊 Mapa Completo de Dados

### Composables (Fonte de Dados)
```
useExpenses.ts
├── expenses: ref<Expense[]>
├── categories: ref<Category[]>
├── fetchExpenses()
├── fetchCategories()
├── upsertExpense()
├── deleteExpense()
├── upsertCategory()
├── deleteCategory()
└── toggleExpenseActive()

useExpenseOccurrences.ts
├── occurrences: ref<ExpenseOccurrence[]>
├── fetchOccurrences()
├── createOccurrence()
├── createRecurringOccurrences()
├── updateOccurrenceStatus()
├── deleteOccurrence()
└── [computed properties]

usePaymentRecords.ts
├── records: ref<PaymentRecord[]>
├── fetchRecords()
├── createRecord()
├── deleteRecord()
└── [computed properties]
```

### Componentes (Consumidores de Dados)
```
despesas.vue (página principal)
├── KMetricsTab.vue
│   ├── usePaymentRecords() → records
│   ├── useExpenseOccurrences() → occurrences
│   └── useExpenses() → categories
├── KAllOccurrencesTab.vue
│   ├── useExpenseOccurrences() → occurrences
│   ├── usePaymentRecords() → createRecord()
│   └── useExpenses() → categories
├── KRecurringExpensesTab.vue
│   ├── useExpenses() → expenses, categories
│   └── KExpenseModal.vue
├── KUniqueExpensesTab.vue
│   ├── useExpenses() → expenses, categories
│   └── KExpenseModal.vue
├── KPaymentHistoryTab.vue
│   ├── usePaymentRecords() → records
│   ├── useExpenseOccurrences() → occurrences
│   └── useExpenses() → categories
└── KCategoriesManagement.vue
    └── useExpenses() → categories
```

## 🔍 Análise de Reatividade

### ✅ Correto (Já Funciona)
- `KCategoriesManagement.vue` - Usa `categories` diretamente do composable
- Componentes chamam `fetchCategories()` no `onMounted()`

### ⚠️ Potencial Problema (Reatividade Quebrada)
Quando um componente faz:
```typescript
const { categories } = useExpenses()
// categories é um ref<Category[]>
// Quando categories.value é atualizado no composable,
// o componente DEVE ver a atualização automaticamente
```

**MAS** se o componente passar `categories` para outro composable:
```typescript
const { categories } = useExpenses()
const { filteredCategories } = useFilters(categories) // ❌ ERRADO
// O composable recebe a ref, mas se categories.value muda,
// a reatividade pode quebrar
```

**SOLUÇÃO**: Usar `toRef()` ou passar a ref diretamente sem desempacotar

## 📋 Checklist de Correção

### Fase 1: Verificar Estrutura ✅
- [x] `useExpenses.ts` retorna `categories` como ref
- [x] `useExpenseOccurrences.ts` retorna `occurrences` como ref
- [x] `usePaymentRecords.ts` retorna `records` como ref
- [x] Todos os composables têm `fetch*()` functions
- [x] Todos os composables têm CRUD operations

### Fase 2: Verificar Componentes
- [ ] KCategoriesManagement.vue - Verificar se categories atualiza
- [ ] KRecurringExpensesTab.vue - Verificar se categories atualiza
- [ ] KUniqueExpensesTab.vue - Verificar se categories atualiza
- [ ] KAllOccurrencesTab.vue - Verificar se occurrences atualiza
- [ ] KPaymentHistoryTab.vue - Verificar se records atualiza
- [ ] KMetricsTab.vue - Verificar se records atualiza

### Fase 3: Aplicar Padrão `toRef()` (Se Necessário)
Se algum componente passar dados para outro composable:
```typescript
// ❌ ERRADO
const { categories } = useExpenses()
const { filtered } = useFilter(categories)

// ✅ CORRETO
import { toRef } from 'vue'
const { categories } = useExpenses()
const { filtered } = useFilter(toRef(categories, 'value'))
```

## 🗄️ Tabelas do Banco de Dados

### Tabela: `expenses`
```sql
id, user_id, description, category_id, amount, 
is_recurring, recurring_frequency, start_date, end_date, 
is_active, notes, created_at, updated_at
```
**Usado por**: `useExpenses.fetchExpenses()`, `upsertExpense()`, `deleteExpense()`

### Tabela: `categories`
```sql
id, user_id, name, color, is_active, created_at, updated_at
```
**Usado por**: `useExpenses.fetchCategories()`, `upsertCategory()`, `deleteCategory()`

### Tabela: `expense_occurrences`
```sql
id, expense_id, user_id, occurrence_date, due_date, 
amount, status, created_at, updated_at
```
**Usado por**: `useExpenseOccurrences.fetchOccurrences()`, `createOccurrence()`, `updateOccurrenceStatus()`, `deleteOccurrence()`

### Tabela: `payment_records`
```sql
id, expense_occurrence_id, user_id, amount, 
payment_date, payment_method, notes, created_at
```
**Usado por**: `usePaymentRecords.fetchRecords()`, `createRecord()`, `deleteRecord()`

## 🔗 Fluxos de Dados

### Fluxo 1: Criar Despesa Recorrente
```
KRecurringExpensesTab.vue
  ↓ (clica "Nova Despesa")
KExpenseModal.vue
  ↓ (preenche e clica "Salvar")
useExpenses.upsertExpense()
  ↓ (INSERT em expenses)
Banco de Dados (expenses)
  ↓ (trigger deveria gerar occurrences)
Banco de Dados (expense_occurrences)
  ↓ (fetchOccurrences() recarrega)
useExpenseOccurrences.occurrences
  ↓ (reatividade atualiza)
KAllOccurrencesTab.vue (mostra novas ocorrências)
```

### Fluxo 2: Marcar Ocorrência como Paga
```
KAllOccurrencesTab.vue
  ↓ (clica "Marcar como Pago")
useExpenseOccurrences.updateOccurrenceStatus()
  ↓ (UPDATE em expense_occurrences)
Banco de Dados (expense_occurrences)
  ↓ (trigger deveria criar payment_record)
Banco de Dados (payment_records)
  ↓ (fetchRecords() recarrega)
usePaymentRecords.records
  ↓ (reatividade atualiza)
KPaymentHistoryTab.vue (mostra novo pagamento)
KMetricsTab.vue (métricas atualizadas)
```

### Fluxo 3: Criar/Editar Categoria
```
KCategoriesManagement.vue
  ↓ (clica "Nova Categoria" ou "Editar")
Modal de Categoria
  ↓ (preenche e clica "Salvar")
useExpenses.upsertCategory()
  ↓ (UPSERT em categories)
Banco de Dados (categories)
  ↓ (fetchCategories() recarrega)
useExpenses.categories
  ↓ (reatividade atualiza)
KCategoriesManagement.vue (mostra nova categoria)
KRecurringExpensesTab.vue (dropdown atualizado)
KUniqueExpensesTab.vue (dropdown atualizado)
```

## 🚨 Problemas Identificados

### 1. Duplicação de Composables
- `useExpenses.ts` tem `fetchCategories()`, `upsertCategory()`, `deleteCategory()`
- `useCategories.ts` tem `createCategory()`, `updateCategory()`, `deleteCategory()`
- **Solução**: Usar apenas `useExpenses.ts` (já está sendo usado)

### 2. Debug Logs Pesados
- `useExpenses.ts` tinha muitos console.log()
- **Solução**: ✅ Removidos

### 3. Falta de Triggers no Banco
- Quando cria despesa recorrente, não gera ocorrências automaticamente
- Quando marca ocorrência como paga, não cria payment_record automaticamente
- **Solução**: Criar triggers no Supabase

### 4. Reatividade Potencialmente Quebrada
- Se componentes passarem `categories` para outro composable sem `toRef()`
- **Solução**: Verificar e aplicar `toRef()` se necessário

## ✅ Próximos Passos

1. **Testar Reatividade** (5 min)
   - Abrir página de despesas
   - Criar categoria
   - Verificar se aparece em todos os componentes
   - Editar categoria
   - Verificar se atualiza em tempo real

2. **Criar Triggers no Banco** (10 min)
   - Trigger ao inserir despesa recorrente: gera ocorrências
   - Trigger ao marcar como pago: cria payment_record

3. **Testar Fluxos Completos** (15 min)
   - Criar despesa recorrente → Verificar ocorrências
   - Marcar como pago → Verificar payment_record
   - Editar categoria → Verificar atualização

4. **Validar Dados** (5 min)
   - Verificar se foreign keys estão corretas
   - Verificar se RLS policies estão funcionando
   - Verificar se índices estão otimizados

## 📝 Notas
- Todos os composables já têm type casting `as any` para evitar erros de TypeScript
- Todos os composables já têm tratamento de erro
- Todos os composables já têm loading states
- Componentes já têm console.log() para debug
