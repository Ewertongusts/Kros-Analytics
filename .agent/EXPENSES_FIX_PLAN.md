# Plano de Ação: Corrigir Página de Despesas

## Status Atual
✅ TypeScript errors corrigidos em `useExpenseOccurrences.ts`
✅ `useExpenses.ts` sem erros
⏳ Próximo: Aplicar padrão `toRef()` nos componentes

## Problema Raiz: Reatividade Quebrada
Assim como no contacts-disappearing-fix, as categorias desaparecem porque:
1. Componentes passam `categories` (plain array) para composables
2. Quando `categories.value` é atualizado no composable, cria um novo array
3. Componentes não veem a atualização porque estão usando a referência antiga
4. Resultado: categorias desaparecem da tela

## Solução: Usar `toRef()` em Todos os Componentes

### Componentes a Corrigir:
1. `KCategoriesManagement.vue` - Já está usando `categories` diretamente ✅
2. `KRecurringExpensesTab.vue` - Precisa usar `toRef()` para `categories`
3. `KUniqueExpensesTab.vue` - Precisa usar `toRef()` para `categories`
4. `KAllOccurrencesTab.vue` - Precisa usar `toRef()` para `occurrences`
5. `KPaymentHistoryTab.vue` - Precisa usar `toRef()` para `paymentRecords`
6. `KMetricsTab.vue` - Precisa usar `toRef()` para `paymentRecords`
7. `KExpenseModal.vue` - Precisa usar `toRef()` para `categories`

## Padrão a Aplicar

### ❌ ERRADO (Atual)
```typescript
const { categories, fetchCategories } = useExpenses()
// categories é um ref, mas quando passado para outro composable, perde reatividade
```

### ✅ CORRETO (Novo)
```typescript
import { toRef } from 'vue'
const { categories, fetchCategories } = useExpenses()
const categoriesRef = toRef(categories, 'value') // Mantém reatividade
// Ou se categories já é um ref:
// const categoriesRef = categories // Já é reativo
```

## Checklist de Correção

### Fase 1: Verificar Estrutura
- [ ] Confirmar que `useExpenses()` retorna `categories` como ref
- [ ] Confirmar que `useExpenseOccurrences()` retorna `occurrences` como ref
- [ ] Confirmar que `usePaymentRecords()` retorna `paymentRecords` como ref

### Fase 2: Aplicar `toRef()` nos Componentes
- [ ] KRecurringExpensesTab.vue
- [ ] KUniqueExpensesTab.vue
- [ ] KAllOccurrencesTab.vue
- [ ] KPaymentHistoryTab.vue
- [ ] KMetricsTab.vue
- [ ] KExpenseModal.vue

### Fase 3: Testar Reatividade
- [ ] Criar categoria → Deve aparecer em todos os componentes
- [ ] Editar categoria → Deve atualizar em tempo real
- [ ] Deletar categoria → Deve desaparecer de todos os componentes
- [ ] Criar despesa → Deve gerar ocorrência
- [ ] Marcar como pago → Deve criar registro de pagamento

## Próximos Passos
1. Aplicar `toRef()` em todos os componentes
2. Testar fluxo completo de despesas
3. Verificar se categorias não desaparecem mais
4. Validar dados no banco de dados
