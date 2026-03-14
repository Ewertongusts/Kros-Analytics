# Revisão Completa - Página de Despesas

## Status Atual
A página de despesas está **funcional mas incompleta**. Precisa de melhorias em:

---

## 1. FUNCIONALIDADES FALTANDO

### 1.1 Relatórios e Exportação
- [ ] Exportar despesas em CSV/Excel
- [ ] Relatório mensal em PDF
- [ ] Gráfico de despesas por categoria
- [ ] Gráfico de tendência mensal
- [ ] Comparação mês anterior vs mês atual

### 1.2 Filtros Avançados
- [ ] Filtro por intervalo de datas
- [ ] Filtro por intervalo de valores
- [ ] Filtro por múltiplas categorias
- [ ] Filtro por status (pago/pendente)
- [ ] Salvar filtros personalizados

### 1.3 Gestão de Despesas
- [ ] Marcar despesa como "paga"
- [ ] Despesas recorrentes com agendamento automático
- [ ] Anexar comprovantes/recibos
- [ ] Notas/observações por despesa
- [ ] Histórico de alterações

### 1.4 Orçamento
- [ ] Definir orçamento mensal por categoria
- [ ] Alertas quando ultrapassar orçamento
- [ ] Visualizar % do orçamento utilizado
- [ ] Comparação orçado vs realizado

### 1.5 Integração com Financeiro
- [ ] Vincular despesas a pagamentos de clientes
- [ ] Calcular margem líquida (receita - despesas)
- [ ] Dashboard financeiro com despesas
- [ ] Previsão de caixa considerando despesas

---

## 2. PROBLEMAS TÉCNICOS A CORRIGIR

### 2.1 Reatividade
**CRÍTICO**: O componente usa `ref()` diretamente para dados do Supabase.
Precisa criar um composable `useExpenses()` similar ao `useCompanies()` para:
- Gerenciar estado centralizado
- Evitar duplicação de lógica
- Manter reatividade correta

### 2.2 Performance
- [ ] Paginação de despesas (atualmente carrega todas)
- [ ] Lazy loading de categorias
- [ ] Cache de dados
- [ ] Debounce em filtros

### 2.3 UX/UI
- [ ] Confirmação antes de deletar (modal, não alert)
- [ ] Toast notifications para sucesso/erro
- [ ] Loading states em botões
- [ ] Validação em tempo real
- [ ] Feedback visual de operações

### 2.4 Dados
- [ ] Campo "status" (pending/paid) na tabela transactions
- [ ] Campo "notes" para observações
- [ ] Campo "receipt_url" para comprovantes
- [ ] Campo "budget_limit" na categoria
- [ ] Índices no banco para performance

---

## 3. PLANO DE IMPLEMENTAÇÃO (PRIORIZADO)

### FASE 1: Fundação (CRÍTICO)
1. Criar composable `useExpenses()` com:
   - fetchExpenses()
   - fetchCategories()
   - upsertExpense()
   - deleteExpense()
   - upsertCategory()
   - deleteCategory()

2. Refatorar KExpensesManagement.vue para usar o composable

3. Adicionar campos ao banco:
   - status (pending/paid)
   - notes
   - receipt_url

### FASE 2: Melhorias Imediatas
1. Substituir alerts por modais/toasts
2. Adicionar paginação
3. Implementar filtro por data
4. Adicionar campo "status" na tabela

### FASE 3: Relatórios
1. Gráfico de despesas por categoria (Chart.js/ApexCharts)
2. Gráfico de tendência mensal
3. Exportar CSV
4. Relatório PDF

### FASE 4: Orçamento
1. Adicionar budget_limit na categoria
2. Alertas de orçamento
3. Visualização de % utilizado
4. Comparação orçado vs realizado

### FASE 5: Avançado
1. Despesas recorrentes com agendamento
2. Anexar comprovantes
3. Integração com financeiro
4. Previsão de caixa

---

## 4. ESTRUTURA DE DADOS NECESSÁRIA

### Tabela: transactions (adicionar campos)
```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'; -- pending, paid
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurring_frequency VARCHAR(20); -- monthly, weekly, etc
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS budget_id UUID REFERENCES expense_budgets(id);

CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_is_recurring ON transactions(is_recurring);
```

### Tabela: expense_budgets (nova)
```sql
CREATE TABLE expense_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  limit_amount DECIMAL(10, 2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, month, year)
);

CREATE INDEX idx_expense_budgets_category ON expense_budgets(category_id);
CREATE INDEX idx_expense_budgets_month_year ON expense_budgets(month, year);
```

### Tabela: expense_categories (adicionar campos)
```sql
ALTER TABLE expense_categories ADD COLUMN IF NOT EXISTS budget_limit DECIMAL(10, 2);
ALTER TABLE expense_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
```

---

## 5. COMPONENTES A CRIAR

### 5.1 useExpenses.ts (Composable)
- Gerenciar estado de despesas
- Métodos CRUD
- Cálculos de estatísticas
- Integração com Supabase

### 5.2 KExpensesChart.vue
- Gráfico de despesas por categoria
- Gráfico de tendência mensal
- Responsivo

### 5.3 KExpensesFiltersAdvanced.vue
- Filtro por data
- Filtro por valor
- Filtro por status
- Salvar filtros

### 5.4 KExpensesBudget.vue
- Visualizar orçamento por categoria
- Alertas de limite
- Comparação orçado vs realizado

### 5.5 KExpensesExport.vue
- Exportar CSV
- Exportar PDF
- Selecionar período

---

## 6. MELHORIAS IMEDIATAS (PRÓXIMAS AÇÕES)

### Ação 1: Criar composable useExpenses()
```typescript
export const useExpenses = () => {
  const supabase = useSupabaseClient()
  const expenses = ref<Expense[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchExpenses = async () => { ... }
  const fetchCategories = async () => { ... }
  const upsertExpense = async (expense: Partial<Expense>) => { ... }
  const deleteExpense = async (id: string) => { ... }
  const upsertCategory = async (category: Partial<Category>) => { ... }
  const deleteCategory = async (id: string) => { ... }

  return {
    expenses,
    categories,
    loading,
    error,
    fetchExpenses,
    fetchCategories,
    upsertExpense,
    deleteExpense,
    upsertCategory,
    deleteCategory
  }
}
```

### Ação 2: Refatorar KExpensesManagement.vue
- Usar `useExpenses()` composable
- Remover lógica duplicada
- Melhorar reatividade

### Ação 3: Adicionar campos ao banco
- status, notes, receipt_url
- Criar índices

### Ação 4: Melhorar UX
- Substituir alerts por modals
- Adicionar toasts
- Loading states

---

## 7. CHECKLIST DE QUALIDADE

- [ ] Composable useExpenses() criado e testado
- [ ] Reatividade funcionando corretamente
- [ ] Sem console errors
- [ ] Paginação implementada
- [ ] Filtros funcionando
- [ ] Modal de confirmação para delete
- [ ] Toast notifications
- [ ] Campos adicionais no banco
- [ ] Índices criados
- [ ] Testes de CRUD
- [ ] Performance otimizada
- [ ] Responsivo em mobile

---

## PRÓXIMAS AÇÕES RECOMENDADAS

1. **Criar composable useExpenses()** - Centralizar lógica
2. **Refatorar componente** - Usar composable
3. **Adicionar campos ao banco** - status, notes, receipt_url
4. **Melhorar UX** - Modals, toasts, validação
5. **Implementar paginação** - Performance
6. **Adicionar gráficos** - Visualização de dados
7. **Orçamento** - Alertas e limites
8. **Exportação** - CSV/PDF

